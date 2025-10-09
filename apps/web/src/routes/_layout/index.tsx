// Framework Specific/Hooks/Providers/Functional Components

// UI/Styles/UI Components
import { FlaskIcon, TrophyIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { CheckCircleIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import type { StickToBottomContext } from "use-stick-to-bottom";
import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { MicroMenu } from "@/components/raffle/micro-menu";
import { MicroMenuMobile } from "@/components/raffle/micro-menu-mobile";
import { RiggedSettings } from "@/components/raffle/rigged-settings";
import { Badge } from "@/components/ui/badge";
import { ServerStatus } from "@/components/ui/server-status";
import { TypographyH4 } from "@/components/ui/typography";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { useGitHubVersion } from "@/hooks/useGitHubVersion";
import { useTwitchEventSub } from "@/hooks/useTwitchEventSub";
// Types/Store State
import { chatStore, isGeneratingMessages, MAX_MESSAGES } from "@/stores/chat";

export const Route = createFileRoute("/_layout/")({
	component: RaffleComponent,
});

function RaffleComponent() {
	const device = useDeviceDetection();
	// Chat state
	const messages = useStore(chatStore, (state) => state.messages);
	const participants = useStore(chatStore, (state) => state.participants);
	const connectionStatus = useStore(
		chatStore,
		(state) => state.connectionStatus,
	);
	const currentChannel = useStore(chatStore, (state) => state.currentChannel);
	const raffleWinners = useStore(chatStore, (state) => state.winners);
	const isRaffleRigged = useStore(chatStore, (state) => state.isRaffleRigged);

	// Debug
	const { version } = useGitHubVersion("Ozmah", "rigged");

	// EventSub auto connects when authenticated
	// DO NOT CALL THIS HOOK ANYWHERE ELSE,
	// its constructor creates a new subscription
	const eventSubHook = useTwitchEventSub();
	const { isConnected, isConnecting } = eventSubHook;
	const contextRef = useRef<StickToBottomContext>(null);

	// Derived state
	const isGeneratingMessagesState = useStore(isGeneratingMessages);

	// Mount all derived state
	useEffect(() => {
		const unsubscribers = [isGeneratingMessages.mount()];

		return () => {
			for (const unsub of unsubscribers) {
				unsub();
			}
		};
	}, []);

	// This hook was created to handle the problem caused by the current message storing approach,
	// messages are stored inside the message Store, we retain a fixed amount and when we reach that,
	// we delete the last message and add the new ones at the beginning, this causes an issue with the
	// component automatic scroll behavior since we "push" the scroll a bit, so we check isAtBottom after
	// 200 ms to ensure that we send the user to the bottom after the store has been updated with the latest
	// message.
	// This is expected to break with very active chats. More testing needed.
	useEffect(() => {
		if (messages.length >= MAX_MESSAGES && contextRef.current?.isAtBottom) {
			setTimeout(() => {
				contextRef.current?.scrollToBottom();
			}, 200);
		}
	}, [messages]);

	return (
		<>
			{/* Version Badge */}
			<div className="fixed right-4 bottom-4 z-50">
				<Badge
					variant="outline"
					className="border-muted-foreground/20 bg-background/80 text-muted-foreground text-xs backdrop-blur-sm transition-colors hover:bg-background/90"
				>
					{version}
				</Badge>
			</div>
			{/* Side Menu */}
			<div className="col-start-1 row-span-5 row-start-8 self-end sm:row-start-2 sm:self-auto 2xl:col-start-2">
				{device.isMobile ? (
					<MicroMenuMobile eventSubHook={eventSubHook} />
				) : (
					<MicroMenu />
				)}
			</div>
			{/* Config Menu Container */}
			<div className="col-span-1 col-start-1 row-span-6 row-start-2 sm:col-span-2 sm:col-start-2 2xl:col-start-3">
				{!device.isMobile && (
					<RiggedSettings eventSubHook={eventSubHook} />
				)}
			</div>
			<div className="col-span-1 col-start-1 row-span-4 row-start-2 p-2 sm:col-span-3 sm:col-start-4 sm:p-0 lg:pr-2 2xl:col-span-4 2xl:col-start-5 2xl:row-span-5">
				{/* Next in the list of migrations, we'll need some work to move chat to its own component */}
				{/* Chat Section */}
				<section className="rounded-lg border">
					<div className="flex items-center justify-start border-b bg-card px-4 py-6 sm:p-8 sm:pb-4">
						<ServerStatus
							status={connectionStatus}
							ping={true}
							size="md"
						/>
						<TypographyH4>
							{currentChannel?.broadcaster_name
								? `Chat de ${currentChannel?.broadcaster_name}`
								: "Error al conectar al chat"}
						</TypographyH4>
						<div className="flex flex-1 justify-end">
							{/* Will create an array of badges to show
							stuff active in the chat (raffle, generate messages, etc.) */}
							{isGeneratingMessagesState && (
								<Badge variant="outline" asChild>
									<FlaskIcon size={25} />
								</Badge>
							)}
						</div>
					</div>
					<div className="relative">
						<Conversation
							contextRef={contextRef}
							className="h-[calc((80vh-32px)*6/7)] sm:h-[calc((60vh-64px)*6/7)] lg:h-[calc((60vh-64px)*6/7)] 2xl:h-[calc((100vh-64px)*6/7)]"
						>
							<ConversationContent>
								{/* Floating element to show participants */}
								{participants.length > 0 && (
									<div className="-translate-x-1/2 absolute top-2 left-1/2 flex transform items-center justify-center rounded-lg border bg-card px-3 py-2 shadow">
										{`Participantes de la rifa ${participants.length}`}
									</div>
								)}
								{/* Floating element to show winners */}
								{isRaffleRigged && raffleWinners.length && (
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										className="-translate-x-1/2 absolute top-20 left-1/2 flex transform flex-col items-center justify-center rounded-xl border-2 border-yellow-400/30 bg-gradient-to-br from-yellow-50/95 to-amber-50/95 px-6 py-4 shadow-xl backdrop-blur-sm dark:border-yellow-400/40 dark:from-yellow-900/20 dark:to-amber-900/20"
									>
										<div className="mb-2 font-bold text-xl text-yellow-600 dark:text-yellow-400">
											{raffleWinners.length === 1 ? (
												<motion.div
													className="flex items-center space-x-2"
													initial={{
														scale: 0,
														rotate: -90,
													}}
													animate={{
														scale: 1,
														rotate: 0,
														y: [0, -8, 0],
													}}
													transition={{
														duration: 0.5,
														ease: "backOut",
													}}
												>
													<TrophyIcon />
													<span>GANADOR</span>
												</motion.div>
											) : (
												<motion.div className="flex items-center space-x-2">
													<TrophyIcon />
													<span>GANADORES</span>
												</motion.div>
											)}
										</div>
										<div className="flex flex-wrap justify-center gap-2">
											{raffleWinners.map(
												(winner, index) => (
													<motion.div
														initial={{ scale: 0 }}
														animate={{ scale: 1 }}
														key={`${winner.userId}${index}`}
														className="rounded-lg border border-yellow-300/50 bg-white/80 px-4 py-2 font-semibold text-yellow-800 shadow-sm dark:border-yellow-600/30 dark:bg-yellow-900/30 dark:text-yellow-200"
													>
														{winner.displayName}
													</motion.div>
												),
											)}
										</div>
									</motion.div>
								)}
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
														className="ml-auto rounded-full border-green-500/20 bg-green-500/10 text-green-600 text-xs dark:text-green-400"
														asChild
													>
														<CheckCircleIcon
															height={30}
															width={17}
														/>
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
