import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { MessageCircle, Skull } from "lucide-react";
import { toast } from "sonner";
import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { FloatingInput } from "@/components/ui/floating-input";
import { ServerStatus } from "@/components/ui/server-status";
import { useTwitchEventSub } from "@/hooks/useTwitchEventSub";
import { authStore } from "@/stores/auth";
import {
	chatStore,
	executeRaffle,
	startRaffleCapture,
	stopRaffleCapture,
	updateRaffleConfig,
} from "@/stores/chat";

export const Route = createFileRoute("/_twitchAuth/raffle")({
	component: RaffleComponent,
});

function RaffleComponent() {
	const user = useStore(authStore, (state) => state.user);

	// Chat state
	const messages = useStore(chatStore, (state) => state.messages);
	const participants = useStore(chatStore, (state) => state.participants);
	const isCapturing = useStore(chatStore, (state) => state.isCapturing);
	const raffleConfig = useStore(chatStore, (state) => state.raffleConfig);
	const connectionStatus = useStore(
		chatStore,
		(state) => state.connectionStatus,
	);

	// EventSub connection (auto-connects when authenticated)
	const { isConnected, isConnecting } = useTwitchEventSub();

	const handleStartCapture = () => {
		startRaffleCapture();
		toast.success("🎲 Captura iniciada", {
			description: `Capturando participantes con la palabra "${raffleConfig.keyword}"`,
			duration: 3000,
		});
	};

	const handleStopCapture = () => {
		stopRaffleCapture();
		toast.info("⏹️ Captura detenida", {
			description: `Se capturaron ${participants.length} participantes únicos.`,
			duration: 3000,
		});
	};

	const handleExecuteRaffle = () => {
		const winners = executeRaffle();
		console.log("Raffle winners:", winners);

		if (winners.length > 0) {
			const winnerNames = winners.map((w) => w.displayName).join(", ");
			toast.success("🎉 ¡Sorteo completado!", {
				description: `Ganador${winners.length > 1 ? "es" : ""}: ${winnerNames}`,
				duration: 8000,
			});
		} else {
			toast.error("❌ No hay participantes", {
				description:
					"No se puede realizar el sorteo sin participantes.",
				duration: 4000,
			});
		}
	};

	const handleKeywordChange = (keyword: string) => {
		updateRaffleConfig({ keyword });
	};

	return (
		<div className="container mx-auto max-w-4xl px-4 py-6">
			{/* App Header */}
			<div className="mb-6 flex items-center justify-center gap-4">
				<div className="text-center">
					<h1 className="font-bold text-2xl text-primary">
						{user?.display_name}
					</h1>
					<div className="mt-1 flex items-center justify-center gap-2">
						<Badge variant="secondary" className="text-xs">
							🎲 Sorteos de Twitch
						</Badge>
						{user?.broadcaster_type && (
							<Badge
								variant={
									user.broadcaster_type === "partner"
										? "default"
										: "outline"
								}
								className="text-xs"
							>
								{user.broadcaster_type === "partner"
									? "👑 Partner"
									: user.broadcaster_type === "affiliate"
										? "⭐ Affiliate"
										: "📺 Streamer"}
							</Badge>
						)}
					</div>
				</div>
			</div>
			<section className="my-5 rounded-lg border bg-card">
				<Card className="gap-1 border-0 bg-transparent">
					<CardHeader />
					<CardContent>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<FloatingInput
									id="keyword"
									label="Palabra clave"
									value={raffleConfig.keyword}
									onChange={handleKeywordChange}
									placeholder="Ej: !sorteo"
								/>
							</div>
							<div className="grid grid-cols-2 gap-2">
								<div className="flex items-end">
									<Button
										onClick={
											isCapturing
												? handleStopCapture
												: handleStartCapture
										}
										disabled={!isConnected}
										variant={
											isCapturing
												? "secondary"
												: "default"
										}
										className="h-10 w-full"
									>
										{isCapturing
											? "Detener Captura"
											: "Iniciar Captura"}
									</Button>
								</div>
								<div className="flex items-end">
									<Button
										onClick={handleExecuteRaffle}
										disabled={
											!isCapturing ||
											participants.length === 0
										}
										variant="outline"
										className="h-10 w-full"
									>
										Sortear ({participants.length})
									</Button>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</section>

			{/* Chat Section */}
			<section className="rounded-lg border">
				<div className="flex items-center justify-start border-b bg-muted/50 px-4 py-2.5">
					<ServerStatus
						status={connectionStatus}
						ping={true}
						size="md"
					/>
					Chat
				</div>
				<div className="relative" style={{ height: "400px" }}>
					<Conversation className="h-full">
						<ConversationContent>
							{messages.length === 0 ? (
								<div className="flex h-full items-center justify-center text-muted-foreground">
									{isConnected
										? "Esperando mensajes del chat..."
										: isConnecting
											? "Conectando al chat..."
											: "El chat se conecta automáticamente"}
								</div>
							) : (
								<div className="space-y-3">
									{messages.map((message) => (
										<div
											key={message.id}
											className={`flex gap-2 ${
												message.isParticipant
													? "rounded bg-green-50 p-2"
													: ""
											}`}
										>
											<span
												className="font-semibold"
												style={{
													color:
														message.color ||
														"#000000",
												}}
											>
												{message.displayName}:
											</span>
											<span>{message.content}</span>
											{message.isParticipant && (
												<Badge
													variant="secondary"
													className="ml-auto text-xs"
												>
													Participante
												</Badge>
											)}
											{message.cheer && (
												<Badge
													variant="outline"
													className="text-xs"
												>
													{message.cheer.bits} bits
												</Badge>
											)}
										</div>
									))}
								</div>
							)}
						</ConversationContent>
						<ConversationScrollButton />
					</Conversation>
				</div>
			</section>
		</div>
	);
}
