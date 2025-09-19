import { QuestionIcon } from "@phosphor-icons/react";
import { useRouteContext } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { useEffect, useId } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
// UI/Styles/UI Components
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TooltipInfo } from "@/components/ui/tooltip-info";
import { TypographyH4, TypographyMuted } from "@/components/ui/typography";
import type { TwitchEventSubHookConstructor } from "@/hooks/useTwitchEventSub";
import { switchToChannel } from "@/lib/channel-switcher";
// Libs
import { handleRaffleAction } from "@/lib/raffleActionHandler";
import { authStore } from "@/stores/auth";
// Types/Store State
import { chatStore, isThisMyStream, setCurrentChannel } from "@/stores/chat";
import { createRaffleUiAction } from "@/types/raffle-ui-factory";

interface RafflePanel {
	className?: string;
	eventSubHook: TwitchEventSubHookConstructor;
}

export function ChatSettingsPanel({
	className = "",
	eventSubHook,
}: RafflePanel) {
	const baseId = useId();
	const user = useStore(authStore, (state) => state.user);
	const context = useRouteContext({ from: "/_layout/" });
	const raffleConfig = useStore(chatStore, (state) => state.raffleConfig);
	const modedChannels = useStore(authStore, (state) => state.modedChannels);

	// Derived state
	const isThisMyStreamState = useStore(isThisMyStream);

	// Mount all derived state
	useEffect(() => {
		const unsubscribers = [isThisMyStream.mount()];

		return () => {
			for (const unsub of unsubscribers) {
				unsub();
			}
		};
	}, []);

	const handleChannelSwitch = async (broadcasterId: string) => {
		console.log("🎯 Canal seleccionado:", broadcasterId);

		let selectedChannel = modedChannels?.find(
			(channel) => channel.broadcaster_id === broadcasterId,
		);

		if (user?.id === broadcasterId) {
			selectedChannel = {
				broadcaster_id: user.id,
				broadcaster_login: user.login,
				broadcaster_name: user.display_name,
			};
		}

		if (!selectedChannel) {
			console.error("❌ Canal no encontrado:", broadcasterId);
			toast.error("❌ Error", {
				description: "Canal no encontrado",
				duration: 3000,
			});
			return;
		}

		const channelFallback = chatStore.state.currentChannel;

		if (user) {
			setCurrentChannel({
				id: selectedChannel.broadcaster_id,
				login: selectedChannel.broadcaster_login,
				name: selectedChannel.broadcaster_name,
			});
		}

		try {
			await switchToChannel(
				broadcasterId,
				selectedChannel.broadcaster_name,
				{ eventSubHook },
				context.twitchAPI,
			);
		} catch (error) {
			console.error("❌ Error en cambio de canal:", error);
			if (channelFallback) {
				setCurrentChannel({
					id: channelFallback.id,
					login: channelFallback.login,
					name: channelFallback.name,
				});
			}
		}
	};

	// Helper for field IDs
	const createFieldId = (name: string) => `${baseId}-${name}`;

	// Field IDs
	const sendRaffleUpdatesId = createFieldId("sendRaffleUpdates");

	return (
		<section className={`space-y-4 ${className}`}>
			<div className="space-y-4">
				<div>
					<TypographyH4>Configuraciones Generales</TypographyH4>
				</div>
				<div>
					<TypographyMuted>
						Canales en los que eres Moderador:
					</TypographyMuted>
				</div>
				<div className="space-y-4">
					{modedChannels && modedChannels.length > 0 && (
						<Select onValueChange={handleChannelSwitch}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Cambia de canal" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>
										Canales que moderas
									</SelectLabel>
									{modedChannels.map((value) => (
										<SelectItem
											key={value.broadcaster_id}
											value={value.broadcaster_id}
										>
											{value.broadcaster_name}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					)}
					{isThisMyStreamState ? (
						<div className="inline-flex space-x-3">
							<Switch
								checked={raffleConfig.sendRaffleUpdates}
								id={sendRaffleUpdatesId}
								onCheckedChange={(checked) =>
									handleRaffleAction(
										createRaffleUiAction.toggleRaffleUpdates(
											checked,
										),
									)
								}
							/>
							<Label
								htmlFor={sendRaffleUpdatesId}
								className="flex-shrink-0 text-sm"
							>
								¿Actualizar chat?
							</Label>
							<TooltipInfo
								icon="QuestionIcon"
								size={16}
								content="Mandar actualizaciones de la rifa al chat con tu usuario"
							/>
						</div>
					) : (
						<div>
							<Button
								onClick={
									user
										? () => handleChannelSwitch(user.id)
										: undefined
								}
								variant="secondary"
								className="w-full font-bold"
							>
								¿Volver a tu canal?
							</Button>
						</div>
					)}
					<Alert variant="default">
						<QuestionIcon />
						<AlertDescription>
							<p>Cambiar de canal reinicia la rifa</p>
						</AlertDescription>
					</Alert>
				</div>
			</div>
		</section>
	);
}
