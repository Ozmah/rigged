import { useStore } from "@tanstack/react-store";
import type React from "react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { TypographyH3, TypographyMuted } from "@/components/ui/typography";
import {
	analyzeMessageFlow,
	type MessageAnalysis,
} from "@/lib/message-analysis";
import { chatStore } from "@/stores/chat";

/**
 * Visualizes invisible characters for debugging purposes
 * Replaces invisible/control characters with readable representations
 */
function visualizeInvisibleChars(str: string): string {
	return (
		str
			.replace(/\u0020/g, "[SPACE]") // Regular space
			.replace(/\u00A0/g, "[NBSP]") // Non-breaking space
			.replace(/\u200B/g, "[ZWSP]") // Zero-width space
			.replace(/\u200C/g, "[ZWNJ]") // Zero-width non-joiner
			.replace(/\u200D/g, "[ZWJ]") // Zero-width joiner
			.replace(/\u2060/g, "[WJ]") // Word joiner
			.replace(/\uFEFF/g, "[BOM]") // Byte order mark
			.replace(/\u034F/g, "[CGJ]") // Combining grapheme joiner
			// biome-ignore lint/suspicious/noControlCharactersInRegex: This function intentionally handles control characters for debugging invisible Unicode issues
			.replace(/[\u0000-\u001F]/g, "[CTRL]") // Control characters (C0 controls)
			.replace(/[\u007F-\u009F]/g, "[CTRL]")
	); // Extended control characters (C1 controls)
}

interface StepCardProps {
	title: string;
	status: boolean;
	details: string;
	className?: string;
}

const StepCard: React.FC<StepCardProps> = ({
	title,
	status,
	details,
	className = "",
}) => (
	<div
		className={`${className} rounded-lg border bg-slate-900/50 p-4 ${status ? "border-green-500" : "border-red-500"}`}
	>
		<div className="pb-2">
			<div className="flex items-center justify-between">
				<h4 className="font-semibold text-slate-200 text-sm">
					{title}
				</h4>
				<Badge variant={status ? "default" : "destructive"}>
					{status ? "✅" : "❌"}
				</Badge>
			</div>
		</div>
		<div className="pt-0">
			<p className="text-slate-400 text-xs">{details}</p>
		</div>
	</div>
);

// This component was done for quick debugging of the main function,
// in future iterations, duplicated logic will be removed and tooling will
// integrate with the addChatMessage function process using the debugging Store.

export const MessageAnalysisTool: React.FC = () => {
	const chatState = useStore(chatStore);
	const [selectedAnalysis, setSelectedAnalysis] =
		useState<MessageAnalysis | null>(null);
	const [analysisHistory, setAnalysisHistory] = useState<MessageAnalysis[]>(
		[],
	);
	const [lastProcessedMessageId, setLastProcessedMessageId] = useState<
		string | null
	>(null);

	// Listen to new messages and analyze them
	useEffect(() => {
		const lastMessage = chatState.messages[chatState.messages.length - 1];
		if (lastMessage && lastMessage.id !== lastProcessedMessageId) {
			// Create a fake EventSubChatMessage from ChatMessage for analysis
			const fakeEventMessage = {
				broadcaster_user_id: "77305523", // Your broadcaster ID
				broadcaster_user_login: "ozmah",
				broadcaster_user_name: "Ozmah",
				chatter_user_id: lastMessage.userId,
				chatter_user_login: lastMessage.username,
				chatter_user_name: lastMessage.displayName,
				message_id: lastMessage.id,
				message: {
					text: lastMessage.content,
					fragments: [
						{ type: "text" as const, text: lastMessage.content },
					],
				},
				color: lastMessage.color,
				badges: lastMessage.badges.map((b) => ({
					set_id: b.setId,
					id: b.id,
					info: b.info,
				})),
				message_type: "text" as const,
				cheer: lastMessage.cheer,
				reply: undefined,
				channel_points_custom_reward_id: undefined,
			};

			const analysis = analyzeMessageFlow(fakeEventMessage, chatState);

			// Mark this message as processed
			setLastProcessedMessageId(lastMessage.id);

			// Keep last 20 analyses
			setAnalysisHistory((prev) => {
				const newHistory = [...prev, analysis].slice(-20);
				// Auto-select the latest analysis if none selected
				if (!selectedAnalysis) {
					setSelectedAnalysis(analysis);
				}
				return newHistory;
			});
		}
	}, [chatState, lastProcessedMessageId, selectedAnalysis]);

	if (!selectedAnalysis) {
		return (
			<div className="p-4 text-center">
				<TypographyMuted>
					Waiting for messages to analyze...
				</TypographyMuted>
			</div>
		);
	}

	const { steps } = selectedAnalysis;

	return (
		<div className="flex flex-col">
			<h3 className="p-4 font-semibold text-muted-foreground text-sm">
				Message Analysis Tool
			</h3>
			<div className="flex h-full flex-row gap-4 p-4">
				{/* Message History Selector - Fixed width sidebar */}
				<div className="w-72 flex-shrink-0 rounded-lg bg-indigo-900/20 p-4">
					<TypographyH3 className="mb-2">
						Message History ({analysisHistory.length})
					</TypographyH3>
					<div className="max-h-96 space-y-1 overflow-y-auto">
						{analysisHistory
							.slice()
							.reverse()
							.map((analysis) => (
								<button
									type="button"
									key={`${analysis.message.id}-${analysis.timestamp.getTime()}`}
									onClick={() =>
										setSelectedAnalysis(analysis)
									}
									className={`flex min-h-[4rem] w-full flex-col justify-between rounded border p-2 text-left text-xs transition-colors ${
										selectedAnalysis?.message.id ===
										analysis.message.id
											? "border-blue-500/30 bg-blue-900/30 text-blue-300"
											: "border-slate-600 bg-slate-800/50 hover:bg-slate-700/50"
									}`}
								>
									<div className="flex flex-shrink-0 items-center justify-between">
										<span className="font-medium">
											{analysis.message.username}
										</span>
										<span className="text-xs opacity-70">
											{analysis.timestamp.toLocaleTimeString()}
										</span>
									</div>
									<div className="flex-grow truncate">
										"
										{visualizeInvisibleChars(
											analysis.message.content,
										)}
										"
									</div>
									<div className="mt-1 flex flex-shrink-0 gap-1">
										<Badge
											variant={
												analysis.steps.finalState
													.messageMarkedAsParticipant
													? "default"
													: "secondary"
											}
											className="px-1 py-0 text-xs"
										>
											{analysis.steps.finalState
												.messageMarkedAsParticipant
												? "✅"
												: "❌"}{" "}
											Marked
										</Badge>
										<Badge
											variant={
												analysis.steps.finalState
													.participantActuallyAdded
													? "default"
													: "secondary"
											}
											className="px-1 py-0 text-xs"
										>
											{analysis.steps.finalState
												.participantActuallyAdded
												? "✅"
												: "❌"}{" "}
											Added
										</Badge>
									</div>
								</button>
							))}
					</div>
				</div>
				{/* Main content area - Takes remaining space */}
				<div className="flex-1 space-y-4">
					{/* Selected Message Analysis */}
					<div className="rounded-lg bg-indigo-900/20 p-4">
						<TypographyH3 className="mb-2">
							Detailed Analysis
						</TypographyH3>
						<div className="mb-2 flex items-center gap-2">
							<Badge variant="outline">
								{selectedAnalysis.message.username}
							</Badge>
							<TypographyMuted className="text-sm">
								{selectedAnalysis.timestamp.toLocaleTimeString()}
							</TypographyMuted>
						</div>
						<code className="block rounded border border-slate-700 bg-slate-950 p-2 text-slate-300 text-sm">
							"
							{visualizeInvisibleChars(
								selectedAnalysis.message.content,
							)}
							"
						</code>
					</div>

					{/* Analysis Steps */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{/* Step 1: Capture State */}
						<StepCard
							title="1. Capture State"
							status={steps.captureState.isCapturing}
							details={`isCapturing: ${steps.captureState.isCapturing ? "true" : "false"}`}
						/>

						{/* Step 2: Keyword Match */}
						<StepCard
							title="2. Keyword Match"
							status={steps.keywordMatch.matches}
							details={`"${visualizeInvisibleChars(steps.keywordMatch.expected)}" vs "${visualizeInvisibleChars(steps.keywordMatch.received)}" (${steps.keywordMatch.mode})`}
						/>

						{/* Step 3: Advanced Filters (if applicable) */}
						{steps.advancedFilters && (
							<StepCard
								title="3. Advanced Filters"
								status={steps.advancedFilters.finalResult}
								details={`Message: ${steps.advancedFilters.messageParticipating ? "✅" : "❌"}, User: ${steps.advancedFilters.userParticipating ? "✅" : "❌"}`}
							/>
						)}

						{/* Step 4: User Deduplication */}
						<StepCard
							title={
								steps.advancedFilters
									? "4. Deduplication"
									: "3. Deduplication"
							}
							status={!steps.userCheck.existingParticipant}
							details={`User ${steps.userCheck.existingParticipant ? "already exists" : "is new"} (${steps.userCheck.userId})`}
						/>

						{/* Step 5: Final Result */}
						<StepCard
							title="Final Result"
							status={steps.finalState.participantActuallyAdded}
							details={`Marked: ${steps.finalState.messageMarkedAsParticipant ? "✅" : "❌"}, Added: ${steps.finalState.participantActuallyAdded ? "✅" : "❌"}`}
							className="md:col-span-2 lg:col-span-1"
						/>
					</div>

					{/* Summary */}
					<div className="rounded-lg bg-indigo-900/20 p-4">
						<TypographyH3 className="mb-2">Summary</TypographyH3>
						<div className="grid gap-2 text-sm">
							<div className="flex justify-between">
								<span>Message marked as participant:</span>
								<Badge
									variant={
										steps.finalState
											.messageMarkedAsParticipant
											? "default"
											: "secondary"
									}
								>
									{steps.finalState.messageMarkedAsParticipant
										? "Yes"
										: "No"}
								</Badge>
							</div>
							<div className="flex justify-between">
								<span>Participant actually added:</span>
								<Badge
									variant={
										steps.finalState
											.participantActuallyAdded
											? "default"
											: "secondary"
									}
								>
									{steps.finalState.participantActuallyAdded
										? "Yes"
										: "No"}
								</Badge>
							</div>
							<div className="flex justify-between">
								<span>Total participants:</span>
								<Badge variant="outline">
									{steps.finalState.totalParticipants}
								</Badge>
							</div>
						</div>
					</div>

					{/* Debug Info */}
					<details className="rounded-lg bg-indigo-900/20">
						<summary className="cursor-pointer p-4 font-medium">
							Debug Information (Click to expand)
						</summary>
						<div className="p-4 pt-0">
							<pre className="max-h-full overflow-auto rounded border border-slate-700 bg-slate-950 p-3 font-mono text-slate-300 text-xs">
								{JSON.stringify(selectedAnalysis, null, 2)}
							</pre>
						</div>
					</details>
				</div>

				{/* Participants List - Right sidebar */}
				<div className="w-72 flex-shrink-0 rounded-lg bg-indigo-900/20 p-4">
					<TypographyH3 className="mb-2">
						Participants ({chatState.participants.length})
					</TypographyH3>
					<div className="max-h-96 space-y-1 overflow-y-auto">
						{chatState.participants.length === 0 ? (
							<TypographyMuted className="text-xs">
								No participants
							</TypographyMuted>
						) : (
							chatState.participants.map((participant) => (
								<div
									key={participant.userId}
									className={`rounded border p-2 text-xs transition-colors ${
										selectedAnalysis?.message.userId ===
										participant.userId
											? "border-blue-500/30 bg-blue-900/30 text-blue-300"
											: "border-slate-600 bg-slate-800/50"
									}`}
								>
									<div className="mb-1 flex items-center justify-between">
										<span className="font-medium">
											{participant.displayName}
										</span>
										<code className="text-xs opacity-70">
											{participant.userId}
										</code>
									</div>
									<div className="text-xs opacity-70">
										@{participant.username}
									</div>
									<div className="mt-1 text-xs opacity-70">
										"
										{visualizeInvisibleChars(
											participant.message,
										)}
										"
									</div>
									<div className="mt-1 text-xs opacity-50">
										{participant.timestamp.toLocaleTimeString()}
									</div>
								</div>
							))
						)}
					</div>
					<div className="mt-2 border-t pt-2 text-muted-foreground text-xs">
						Total: {chatState.participants.length} participants
					</div>
				</div>
			</div>
		</div>
	);
};
