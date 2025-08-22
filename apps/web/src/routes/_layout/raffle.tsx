import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { MicroMenu } from "@/components/raffle/micro-menu";
import { SettingsPanel } from "@/components/raffle/settings-panel";
import { Badge } from "@/components/ui/badge";
import { ServerStatus } from "@/components/ui/server-status";
import { TypographyH4 } from "@/components/ui/typography";
import { useTwitchEventSub } from "@/hooks/useTwitchEventSub";
import { chatStore } from "@/stores/chat";

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

	// EventSub connection (auto-connects when authenticated)
	const { isConnected, isConnecting } = useTwitchEventSub();

	return (
		<>
			<div className="col-start-2 row-span-5 row-start-2">
				<MicroMenu />
			</div>
			<div className="col-span-2 col-start-3 row-span-6 row-start-2">
				<SettingsPanel />
			</div>
			<div className="col-span-4 col-start-5 row-span-6 row-start-2">
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
						<Conversation className="h-[600px]">
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
