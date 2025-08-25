import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { useEffect, useRef } from "react";
import type { StickToBottomContext } from "use-stick-to-bottom";
import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { MicroMenu } from "@/components/raffle/micro-menu";
import { SettingsPanel } from "@/components/raffle/settings-panel";
import { ShowRaffleState } from "@/components/show-raffle-state";
import { Badge } from "@/components/ui/badge";
import { ServerStatus } from "@/components/ui/server-status";
import { TypographyH4 } from "@/components/ui/typography";
import { useTwitchEventSub } from "@/hooks/useTwitchEventSub";
import { chatStore, MAX_MESSAGES } from "@/stores/chat";
import { uiStore } from "@/stores/ui";

export const Route = createFileRoute("/_layout/raffle")({
	component: RaffleComponent,
});

function RaffleComponent() {
	// Chat state
	const messages = useStore(chatStore, (state) => state.messages);
	const connectionStatus = useStore(
		chatStore,
		(state) => state.connectionStatus,
	);

	// UI State
	const isRaffleStateOpen = useStore(
		uiStore,
		(state) => state.isRaffleStateOpen,
	);

	// EventSub connection (auto-connects when authenticated)
	const { isConnected, isConnecting } = useTwitchEventSub();
	const contextRef = useRef<StickToBottomContext>(null);

	useEffect(() => {
		if (messages.length >= MAX_MESSAGES && contextRef.current?.isAtBottom) {
			setTimeout(() => {
				contextRef.current?.scrollToBottom();
			}, 200);
		}
	}, [messages]);

	return (
		<>
			<div className="col-span-2 col-start-9 row-span-5 row-start-2">
				{isRaffleStateOpen && <ShowRaffleState />}
			</div>
			<div className="col-start-2 row-span-5 row-start-2">
				<MicroMenu />
			</div>
			<div className="col-span-2 col-start-3 row-span-6 row-start-2">
				<SettingsPanel />
			</div>
			<div className="col-span-4 col-start-5 row-span-5 row-start-2">
				{/* Chat Section */}
				<section className="rounded-lg border">
					<div className="flex items-center justify-start border-b bg-card px-4 py-4">
						<ServerStatus
							status={connectionStatus}
							ping={true}
							size="md"
						/>
						<TypographyH4>Chat</TypographyH4>
					</div>
					<div className="relative">
						<Conversation
							contextRef={contextRef}
							className="h-[calc((100vh-64px)*6/7)]"
						>
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
														? "rounded border border-green-500/20 p-2"
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
														className="ml-auto border-green-500/20 bg-green-500/10 text-green-600 text-xs dark:text-green-400"
													>
														Participante
													</Badge>
												)}
												{message.cheer && (
													<Badge
														variant="outline"
														className="text-xs"
													>
														{message.cheer.bits}{" "}
														bits
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
		</>
	);
}
