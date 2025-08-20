import { Store } from "@tanstack/store";
import type { EventSubChatMessage } from "@/lib/twitch-api-client";

// Max messages to be kept in state
const MAX_MESSAGES = 100;

/**
 * Processed chat message for UI display
 */
export interface ChatMessage {
	id: string;
	username: string;
	displayName: string;
	userId: string;
	content: string;
	timestamp: Date;
	color: string;
	badges: Array<{
		setId: string;
		id: string;
		info: string;
	}>;
	messageType: "text" | "highlight" | "sub_only" | "intro";
	isParticipant: boolean;
	cheer?: {
		bits: number;
	};
}

/**
 * Raffle participant information
 */
export interface RaffleParticipant {
	userId: string;
	username: string;
	displayName: string;
	message: string;
	timestamp: Date;
	isWinner: boolean;
	badges: string[];
}

/**
 * Chat connection status
 */
export type ConnectionStatus =
	| "disconnected"
	| "connecting"
	| "connected"
	| "error"
	| "reconnecting";

/**
 * Raffle configuration
 */
export interface RaffleConfig {
	keyword: string;
	caseSensitive: boolean;
	wholeWordOnly: boolean;
	ignoreCommands: boolean;
	maxWinners: number;
	removeWinners: boolean;
}

/**
 * Chat and raffle state
 */
export interface ChatState {
	// Connection
	connectionStatus: ConnectionStatus;
	connectionError: string | null;

	// Chat messages
	messages: ChatMessage[];
	maxMessages: number;

	// Raffle
	raffleConfig: RaffleConfig;
	participants: RaffleParticipant[];
	winners: RaffleParticipant[];
	isCapturing: boolean;
	currentRound: number;

	// Statistics
	stats: {
		totalMessages: number;
		uniqueParticipants: number;
		messagesPerMinute: number;
		captureStartTime?: Date;
	};

	debug: {
		chatInterval?: NodeJS.Timeout;
		isChatGenerating: boolean;
	};
}

/**
 * Initial chat state
 */
const initialState: ChatState = {
	connectionStatus: "disconnected",
	connectionError: null,

	messages: [],
	maxMessages: MAX_MESSAGES,

	raffleConfig: {
		keyword: "",
		caseSensitive: false,
		wholeWordOnly: false,
		ignoreCommands: true,
		maxWinners: 1,
		removeWinners: true,
	},

	participants: [],
	winners: [],
	isCapturing: false,
	currentRound: 0,

	stats: {
		totalMessages: 0,
		uniqueParticipants: 0,
		messagesPerMinute: 0,
	},

	debug: {
		chatInterval: undefined,
		isChatGenerating: false,
	},
};

/**
 * Chat store instance
 */
export const chatStore = new Store<ChatState>(initialState);

/**
 * Sets connection status
 * @param status - New connection status
 * @param error - Optional error message
 */
export const setConnectionStatus = (
	status: ConnectionStatus,
	error?: string,
) => {
	chatStore.setState((state) => ({
		...state,
		connectionStatus: status,
		connectionError: error || null,
	}));
};

/**
 * Processes EventSub chat message and adds to store
 * @param eventMessage Raw EventSub message
 */
export const addChatMessage = (eventMessage: EventSubChatMessage) => {
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

	chatStore.setState((state) => {
		const newMessages = [...state.messages, message];

		// Keep only last maxMessages
		if (newMessages.length > state.maxMessages) {
			newMessages.splice(0, newMessages.length - state.maxMessages);
		}

		// Check if this message qualifies for raffle participation
		const isParticipating =
			state.isCapturing &&
			checkRaffleParticipation(message.content, state.raffleConfig);

		// Update message participation status
		if (isParticipating) {
			message.isParticipant = true;
		}

		// Add to participants if qualifying and not already participating
		const newParticipants = [...state.participants];
		if (isParticipating) {
			const existingParticipant = newParticipants.find(
				(p) => p.userId === message.userId,
			);
			if (!existingParticipant) {
				const participant: RaffleParticipant = {
					userId: message.userId,
					username: message.username,
					displayName: message.displayName,
					message: message.content,
					timestamp: message.timestamp,
					isWinner: false,
					badges: message.badges.map((b) => b.setId),
				};
				newParticipants.push(participant);
			}
		}

		return {
			...state,
			messages: newMessages,
			participants: newParticipants,
			stats: {
				...state.stats,
				totalMessages: state.stats.totalMessages + 1,
				uniqueParticipants: newParticipants.length,
			},
		};
	});
};

export const startTestMessageGeneration = () => {
	const chatterNames = ["Chayote", "Platano", "Sandia", "Manzana"];

	const GAMING_MESSAGES = [
		"gg",
		"poggers",
		"let's go!",
		"clutch",
		"ez clap",
		"omg",
		"noway",
		"insane",
		"wp",
		"rip",
		"Hay pick!",
	];

	const EMOTE_MESSAGES = [
		"Kappa",
		"PogChamp",
		"EZ Clap",
		"5Head",
		"OMEGALUL",
		"MonkaS",
		"Pepega",
		"KEKW",
		"Sadge",
		"Copium",
	];

	const CHAT_MESSAGES = [
		"hi",
		"hello",
		"sup",
		"yo",
		"hey",
		"what's up",
		"how's it going",
		"nice",
		"cool",
		"awesome",
	];

	const HYPE_MESSAGES = [
		"HYPE",
		"LET'S GOOOO",
		"POGGERS",
		"SHEESH",
		"FIRE",
		"CLEAN",
		"NASTY",
		"CRACKED",
		"BUILT DIFFERENT",
		"NO CAP",
	];

	const TOXIC_MESSAGES = [
		"Quítate esa chingadera!",
		"No merecíamos ganar",
		"ggn't",
		"Manau está tirando",
		"Aparte de dps, también tengo que tanquear?",
	];

	const ALL_MESSAGES = [
		...GAMING_MESSAGES,
		...EMOTE_MESSAGES,
		...CHAT_MESSAGES,
		...HYPE_MESSAGES,
		...TOXIC_MESSAGES,
	];

	const interval = setInterval(() => {
		const randomChatter =
			chatterNames[Math.floor(Math.random() * chatterNames.length)];
		const randomMessage =
			ALL_MESSAGES[Math.floor(Math.random() * ALL_MESSAGES.length)];
		const fakeMessage: EventSubChatMessage = {
			broadcaster_user_id: "77305523",
			broadcaster_user_login: "ozmah",
			broadcaster_user_name: "Ozmah",
			chatter_user_id: `${Math.random().toString().slice(2, 10)}`,
			chatter_user_login: randomChatter.toLowerCase(),
			chatter_user_name: randomChatter,
			message_id: `${Math.random().toString(36).slice(2, 11)}`,
			message: {
				text: randomMessage,
				fragments: [
					{
						type: "text",
						text: randomMessage,
					},
				],
			},
			color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random hex color
			badges: [], // Empty array for simplicity
			message_type: "text",
			cheer: undefined, // No bits for fake messages
			reply: undefined, // No replies for fake messages
			channel_points_custom_reward_id: undefined,
		};
		addChatMessage(fakeMessage);
	}, 2000);

	chatStore.setState((state) => ({
		...state,
		debug: {
			...state.debug,
			chatInterval: interval,
			isChatGenerating: true,
		},
	}));
	console.log(
		`START FN: Chat Generating: ${chatStore.state.debug.isChatGenerating}`,
	);
	console.log(chatStore.state.debug);
};

export const stopTestMessageGeneration = () => {
	if (!chatStore.state.debug.chatInterval) {
		return;
	}
	const currentIntervalId = chatStore.state.debug.chatInterval;
	chatStore.setState((state) => ({
		...state,
		debug: {
			...state.debug,
			chatInterval: undefined,
			isChatGenerating: false,
		},
	}));
	clearInterval(currentIntervalId);
};

/**
 * Checks if a message qualifies for raffle participation
 * @param content - Message content
 * @param config - Raffle configuration
 * @returns Whether message qualifies
 */
function checkRaffleParticipation(
	content: string,
	config: RaffleConfig,
): boolean {
	// Ignore commands if configured
	if (
		config.ignoreCommands &&
		content.startsWith("!") &&
		config.keyword !== content.trim()
	) {
		return false;
	}

	const messageText = config.caseSensitive ? content : content.toLowerCase();
	const keyword = config.caseSensitive
		? config.keyword
		: config.keyword.toLowerCase();

	if (config.wholeWordOnly) {
		// Check for whole word match
		const words = messageText.split(/\s+/);
		return words.includes(keyword);
	}
	// Check for substring match
	return messageText.includes(keyword);
}

/**
 * Updates raffle configuration
 * @param config - New raffle configuration
 */
export const updateRaffleConfig = (config: Partial<RaffleConfig>) => {
	chatStore.setState((state) => ({
		...state,
		raffleConfig: { ...state.raffleConfig, ...config },
	}));
};

/**
 * Starts raffle capture
 */
export const startRaffleCapture = () => {
	chatStore.setState((state) => ({
		...state,
		isCapturing: true,
		participants: [], // Clear previous participants
		winners: [], // Clear previous winners
		currentRound: 0,
		stats: {
			...state.stats,
			captureStartTime: new Date(),
			uniqueParticipants: 0,
		},
	}));
};

/**
 * Stops raffle capture
 */
export const stopRaffleCapture = () => {
	chatStore.setState((state) => ({
		...state,
		isCapturing: false,
	}));
};

/**
 * Executes raffle and selects winners
 * @returns Selected winners
 */
export const executeRaffle = (): RaffleParticipant[] => {
	let winners: RaffleParticipant[] = [];

	chatStore.setState((state) => {
		// Get available participants (exclude previous winners if configured)
		const availableParticipants = state.raffleConfig.removeWinners
			? state.participants.filter((p) => !p.isWinner)
			: state.participants;

		if (availableParticipants.length === 0) {
			return state; // No participants available
		}

		// Select random winners
		const numWinners = Math.min(
			state.raffleConfig.maxWinners,
			availableParticipants.length,
		);
		const selectedWinners = selectRandomParticipants(
			availableParticipants,
			numWinners,
		);

		// Mark as winners
		selectedWinners.forEach((winner) => {
			winner.isWinner = true;
		});

		// Update participants list
		const updatedParticipants = state.participants.map((p) => {
			const isWinner = selectedWinners.find((w) => w.userId === p.userId);
			return isWinner ? { ...p, isWinner: true } : p;
		});

		winners = selectedWinners;

		return {
			...state,
			participants: updatedParticipants,
			winners: [...state.winners, ...selectedWinners],
			currentRound: state.currentRound + 1,
		};
	});

	return winners;
};

/**
 * Selects random participants from available list
 * @param participants - Available participants
 * @param count - Number to select
 * @returns Selected participants
 */
function selectRandomParticipants(
	participants: RaffleParticipant[],
	count: number,
): RaffleParticipant[] {
	if (count >= participants.length) {
		return [...participants];
	}

	const selected: RaffleParticipant[] = [];
	const available = [...participants];

	for (let i = 0; i < count; i++) {
		const randomIndex = Math.floor(Math.random() * available.length);
		selected.push(available[randomIndex]);
		available.splice(randomIndex, 1);
	}

	return selected;
}

/**
 * Resets raffle state for new raffle
 */
export const resetRaffle = () => {
	chatStore.setState((state) => ({
		...state,
		participants: [],
		winners: [],
		isCapturing: false,
		currentRound: 0,
		stats: {
			...state.stats,
			uniqueParticipants: 0,
			captureStartTime: undefined,
		},
	}));
};

/**
 * Clears chat messages
 */
export const clearChatMessages = () => {
	chatStore.setState((state) => ({
		...state,
		messages: [],
		stats: {
			...state.stats,
			totalMessages: 0,
		},
	}));
};

/**
 * Gets current raffle statistics
 * @returns Current statistics
 */
export const getRaffleStats = () => {
	const state = chatStore.state;
	const now = new Date();
	const startTime = state.stats.captureStartTime;

	let messagesPerMinute = 0;
	if (startTime) {
		const minutesElapsed =
			(now.getTime() - startTime.getTime()) / (1000 * 60);
		if (minutesElapsed > 0) {
			messagesPerMinute = Math.round(
				state.stats.totalMessages / minutesElapsed,
			);
		}
	}

	return {
		...state.stats,
		messagesPerMinute,
		availableParticipants: state.raffleConfig.removeWinners
			? state.participants.filter((p) => !p.isWinner).length
			: state.participants.length,
	};
};
