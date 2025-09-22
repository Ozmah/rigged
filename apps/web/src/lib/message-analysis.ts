import type { ChatMessage, ChatState, RaffleConfig } from "@/stores/chat";
import type { EventSubChatMessage } from "./twitch-api-client";

// Helper functions - replicated from chat.ts since they're not exported
function checkMessageRaffleParticipation(
	message: string,
	config: RaffleConfig,
): boolean {
	// Case sensitive logic
	const messageText = config.caseSensitive
		? message.trim()
		: message.trim().toLowerCase();
	const keyword = config.caseSensitive
		? config.keyword
		: config.keyword.toLowerCase();

	console.log(`Message Text: ${messageText}`);
	console.log(`Keyword: ${keyword}`);
	console.log(`Comparison: ${messageText === keyword}`);

	const isParticipating = keyword === messageText;

	// Ignore commands if configured
	return isParticipating;
}

function checkUserRaffleParticipation(
	message: ChatMessage,
	config: RaffleConfig,
): boolean {
	let isParticipant = true;

	// Remove winners logic (simplified for analysis)
	if (config.removeWinners) {
		// Note: We can't access chatStore.state.winners here
		// This would need to be passed as parameter in real implementation
		isParticipant = true; // Simplified for now
	}

	// Check badges for filtering
	const userBadges = message.badges.map((b) => b.setId);

	if (config.ignoreMods && userBadges.includes("moderator")) {
		isParticipant = false;
	}

	if (config.ignoreSubs && userBadges.includes("subscriber")) {
		isParticipant = false;
	}

	if (config.ignoreVips && userBadges.includes("vip")) {
		isParticipant = false;
	}

	return isParticipant;
}

export interface MessageAnalysis {
	message: ChatMessage;
	timestamp: Date;
	steps: {
		// Paso 1: Message Processing
		messageCreated: {
			success: boolean;
			messageType: string;
			content: string;
		};

		// Paso 2: Capture State Check
		captureState: {
			isCapturing: boolean;
			shouldProcess: boolean;
		};

		// Paso 3: Keyword Matching
		keywordMatch: {
			mode: "simple" | "advanced";
			expected: string;
			received: string;
			caseSensitive: boolean;
			matches: boolean;
		};

		// Paso 4: Advanced Filtering (si aplica)
		advancedFilters?: {
			messageParticipating: boolean;
			userParticipating: boolean;
			finalResult: boolean;
		};

		// Paso 5: User Deduplication
		userCheck: {
			userId: string;
			username: string;
			existingParticipant: boolean;
			willBeAdded: boolean;
		};

		// Paso 6: Final Result
		finalState: {
			messageMarkedAsParticipant: boolean;
			participantActuallyAdded: boolean;
			totalParticipants: number;
		};
	};
}

export interface KeywordMatch {
	mode: "simple" | "advanced";
	expected: string;
	received: string;
	caseSensitive: boolean;
	matches: boolean;
}

export interface AdvancedFilters {
	messageParticipating: boolean;
	userParticipating: boolean;
	finalResult: boolean;
}

/**
 * Analyzes a message through the same logic as addChatMessage
 * but without modifying state - pure analysis function
 */
export const analyzeMessageFlow = (
	eventMessage: EventSubChatMessage,
	currentState: ChatState,
): MessageAnalysis => {
	// Paso 1: Create ChatMessage (replica la lógica de addChatMessage)
	const message: ChatMessage = {
		id: eventMessage.message_id,
		username: eventMessage.chatter_user_login,
		displayName: eventMessage.chatter_user_name,
		userId: eventMessage.chatter_user_id,
		content: eventMessage.message.text,
		timestamp: new Date(),
		color: eventMessage.color || "#000000",
		badges: eventMessage.badges.map((badge) => ({
			setId: badge.set_id,
			id: badge.id,
			info: badge.info,
		})),
		messageType:
			eventMessage.message_type === "text"
				? "text"
				: eventMessage.message_type === "channel_points_highlighted"
					? "highlight"
					: eventMessage.message_type === "channel_points_sub_only"
						? "sub_only"
						: "intro",
		isParticipant: false,
		cheer: eventMessage.cheer,
	};

	// Paso 2: Check capture state
	const captureState = {
		isCapturing: currentState.isCapturing,
		shouldProcess: currentState.isCapturing,
	};

	// Paso 3 & 4: Participation logic (replica exacta de addChatMessage)
	let keywordMatch: KeywordMatch;
	let advancedFilters: AdvancedFilters | undefined;
	let messageWillBeMarkedAsParticipant = false;

	if (captureState.isCapturing) {
		if (currentState.raffleConfig.advanced) {
			// Advanced mode
			const isMessageParticipating = checkMessageRaffleParticipation(
				message.content,
				currentState.raffleConfig,
			);
			const isUserParticipating = checkUserRaffleParticipation(
				message,
				currentState.raffleConfig,
			);

			messageWillBeMarkedAsParticipant =
				isMessageParticipating && isUserParticipating;

			keywordMatch = {
				mode: "advanced" as const,
				expected: currentState.raffleConfig.keyword,
				received: message.content,
				caseSensitive: currentState.raffleConfig.caseSensitive,
				matches: isMessageParticipating,
			};

			advancedFilters = {
				messageParticipating: isMessageParticipating,
				userParticipating: isUserParticipating,
				finalResult: messageWillBeMarkedAsParticipant,
			};
		} else {
			// Simple mode
			const simpleMatch =
				currentState.raffleConfig.keyword.trim().toLowerCase() ===
				message.content.trim().toLowerCase();

			messageWillBeMarkedAsParticipant = simpleMatch;

			keywordMatch = {
				mode: "simple" as const,
				expected: currentState.raffleConfig.keyword,
				received: message.content,
				caseSensitive: false,
				matches: simpleMatch,
			};
		}
	} else {
		const mode = currentState.raffleConfig.advanced ? "advanced" : "simple";
		keywordMatch = {
			mode: mode as "simple" | "advanced",
			expected: currentState.raffleConfig.keyword,
			received: message.content,
			caseSensitive: currentState.raffleConfig.caseSensitive,
			matches: false,
		};
	}

	// Paso 5: User deduplication check
	// Note: This analysis might run after addChatMessage already processed the user
	const existingParticipant = currentState.participants.find(
		(p) => p.userId === message.userId,
	);

	// Debug: Log the state for troubleshooting
	console.log("🔍 Deduplication Debug:", {
		userId: message.userId,
		username: message.username,
		existingParticipant: !!existingParticipant,
		totalParticipants: currentState.participants.length,
		participantUserIds: currentState.participants.map((p) => p.userId),
	});

	const willActuallyBeAdded =
		messageWillBeMarkedAsParticipant && !existingParticipant;

	const userCheck = {
		userId: message.userId,
		username: message.username,
		existingParticipant: !!existingParticipant,
		willBeAdded: willActuallyBeAdded,
	};

	// Paso 6: Final state calculation
	const finalState = {
		messageMarkedAsParticipant: messageWillBeMarkedAsParticipant,
		participantActuallyAdded: willActuallyBeAdded,
		totalParticipants:
			currentState.participants.length + (willActuallyBeAdded ? 1 : 0),
	};

	return {
		message,
		timestamp: new Date(),
		steps: {
			messageCreated: {
				success: true,
				messageType: message.messageType,
				content: message.content,
			},
			captureState,
			keywordMatch,
			advancedFilters,
			userCheck,
			finalState,
		},
	};
};
