import { Store } from "@tanstack/store";
import type { EventSubChatMessage } from "@/lib/twitch-api-client";

export const MAX_MESSAGES = 100;

const RAFFLE_OPTIONS_STORAGE_KEY = "rigged-raffle-options";

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
 * Raffle configurations saved to Local Storage
 */
export interface PersistedRaffleConfig {
	advanced: boolean;
	caseSensitive: boolean;
	removeWinners: boolean;
	followersOnly: boolean;
	subsExtraTickets: boolean;
	subsExtraValue: number;
	vipsExtraTickets: boolean;
	vipsExtraValue: number;
	ignoreMods: boolean;
	ignoreSubs: boolean;
	ignoreVips: boolean;
	ticketValue: number;
	// There was a maxWinners and was ditched
	// to allow streamers to pick as many
	// winners as they want
}

/**
 * All Raffle configuration
 */
export interface RaffleConfig extends PersistedRaffleConfig {
	keyword: string;
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
	isRaffleRigged: boolean;
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
 * Save auth state to localStorage
 */
export const saveRaffleConfigState = (state: RaffleConfig): void => {
	try {
		const persistedData: PersistedRaffleConfig = {
			advanced: state.advanced,
			caseSensitive: state.caseSensitive,
			removeWinners: state.removeWinners,
			followersOnly: state.followersOnly,
			subsExtraTickets: state.subsExtraTickets,
			subsExtraValue: state.subsExtraValue,
			vipsExtraTickets: state.vipsExtraTickets,
			vipsExtraValue: state.vipsExtraValue,
			ignoreMods: state.ignoreMods,
			ignoreSubs: state.ignoreSubs,
			ignoreVips: state.ignoreVips,
			ticketValue: state.ticketValue,
		};

		localStorage.setItem(
			RAFFLE_OPTIONS_STORAGE_KEY,
			JSON.stringify(persistedData),
		);
	} catch (error) {
		console.warn("Failed to save raffle state:", error);
	}
};

/**
 * Load auth state from localStorage
 */
export const loadPersistedRaffleConfigState = (): Partial<RaffleConfig> => {
	try {
		const stored = localStorage.getItem(RAFFLE_OPTIONS_STORAGE_KEY);
		if (!stored) return {};

		const parsed: PersistedRaffleConfig = JSON.parse(stored);

		return {
			advanced: parsed.advanced,
			caseSensitive: parsed.caseSensitive,
			removeWinners: parsed.removeWinners,
			followersOnly: parsed.followersOnly,
			subsExtraTickets: parsed.subsExtraTickets,
			subsExtraValue: parsed.subsExtraValue,
			vipsExtraTickets: parsed.vipsExtraTickets,
			vipsExtraValue: parsed.vipsExtraValue,
			ignoreMods: parsed.ignoreMods,
			ignoreSubs: parsed.ignoreSubs,
			ignoreVips: parsed.ignoreVips,
			ticketValue: parsed.ticketValue,
		};
	} catch (error) {
		console.warn("Failed to load persisted raffle config state:", error);
		localStorage.removeItem(RAFFLE_OPTIONS_STORAGE_KEY);
		return {};
	}
};

/**
 * Initial chat state with comprehensive configuration documentation.
 *
 * Connection State:
 * - connectionStatus: "disconnected" - Initial offline state before EventSub connection
 * - connectionError: null - No connection errors present at startup
 *
 * Chat Configuration:
 * - messages: [] - Empty message history at application start
 * - maxMessages: 100 - Maximum number of messages retained in memory to prevent memory leaks
 *
 * Raffle Configuration:
 * - keyword: "" - Empty keyword requiring user configuration before raffle capture can begin
 * - advanced: false - Advanced options are disabled by default
 * - caseSensitive: false - Case-insensitive keyword matching for better user experience
 * - removeWinners: true - Previous winners are excluded from subsequent raffle rounds
 * - followersOnly: false - Followers-only mode disabled (implementation pending)
 * - subsExtraTickets: false - Extra tickets for subscribers disabled by default
 * - subsExtraValue: 1 - Number of extra tickets for subscribers when enabled
 * - vipsExtraTickets: false - Extra tickets for VIPs disabled by default
 * - vipsExtraValue: 1 - Number of extra tickets for VIPs when enabled
 * - ignoreMods: false - Moderators can participate in raffles by default
 * - ignoreSubs: false - Subscribers can participate in raffles by default
 * - ignoreVips: false - VIPs can participate in raffles by default
 * - ticketValue: 1 - Base ticket value for all participants
 *
 * Raffle State Management:
 * - participants: [] - No participants captured at startup
 * - winners: [] - No winners selected initially
 * - isCapturing: false - Raffle capture is disabled until explicitly started by user
 * - isRaffleRigged: false - Raffle is in the final step to select a winner
 * - currentRound: 0 - Raffle system starts at round zero
 *
 * Statistics Tracking:
 * - totalMessages: 0 - Message counter starts at zero
 * - uniqueParticipants: 0 - Participant tracking begins empty
 * - messagesPerMinute: 0 - Performance metric initialized to zero
 * - captureStartTime: undefined - Raffle capture start time not set initially
 *
 * Debug Configuration:
 * - chatInterval: undefined - No test message generation running initially
 * - isChatGenerating: false - Debug message generation is disabled by default
 */
const initialState: ChatState = {
	connectionStatus: "disconnected",
	connectionError: null,

	messages: [],
	maxMessages: MAX_MESSAGES,

	raffleConfig: {
		keyword: "",
		advanced: false,
		caseSensitive: false,
		removeWinners: true,
		followersOnly: false,
		subsExtraTickets: false,
		subsExtraValue: 1,
		vipsExtraTickets: false,
		vipsExtraValue: 1,
		ignoreMods: false,
		ignoreSubs: false,
		ignoreVips: false,
		ticketValue: 1,
		...loadPersistedRaffleConfigState(),
	},

	participants: [],
	winners: [],
	isCapturing: false,
	isRaffleRigged: false,
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

// Subscribe to state changes to persist Chat data
chatStore.subscribe(() => {
	const state = chatStore.state.raffleConfig;
	saveRaffleConfigState(state);
});

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

		if (state.raffleConfig.advanced) {
			const isMessageParticipating =
				state.isCapturing &&
				checkMessageRaffleParticipation(
					message.content,
					state.raffleConfig,
				);

			const isUserParticipating =
				state.isCapturing &&
				checkUserRaffleParticipation(message, state.raffleConfig);

			message.isParticipant =
				isMessageParticipating && isUserParticipating;
		} else {
			message.isParticipant =
				state.raffleConfig.keyword.trim().toLowerCase() ===
				message.content.trim().toLowerCase();
		}

		const newParticipants = [...state.participants];
		if (message.isParticipant) {
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
	setTimeout(() => {
		// Trigger scroll event para que recalcule isAtBottom
		const container = document.querySelector('[role="log"]');
		container?.dispatchEvent(new Event("scroll"));
	}, 0);
};

export const startTestMessageGeneration = () => {
	const chatterNames = [
		"CarlosDMBot",
		"BrayamsBot",
		"EbrionBot",
		"ChecaBot",
		"RammsirisBot",
		"NavarritoBot",
	];

	const GAMING_MESSAGES = [
		"gg ez",
		"poggers",
		"ez tu mamá en bici",
		"nt",
		"rip",
		"Hay pick!",
		"Está a uno!",
		"Yo hice 37 Kills",
	];

	const EMOTE_MESSAGES = [
		"Kappa",
		"PogChamp",
		"ClaapyHype",
		"KEKW",
		"ozmahGasm",
		"ozmahCry",
		"draven78Cine",
		"KEKW",
		"Sadge",
		"ozmahCine",
		"PokPikachu",
	];

	const CHAT_MESSAGES = [
		"Qué pedo!",
		"Wenas",
		"El PRI robó más",
		"Puro primo",
	];

	const HYPE_MESSAGES = [
		"POGGERS",
		"ES CINE",
		"Muy buena, señores",
		"Eso chingado!",
		"Saludsita banda",
	];

	const TOXIC_MESSAGES = [
		"Quítate esa chingadera!",
		"No merecíamos ganar",
		"ggn't",
		"Manau está tirando",
		"Aparte de dps, también tengo que tanquear?",
		"Trae mouse!",
		"Trae xim!",
		"Peak check!",
		"Ese cabrón es, mínimo, GM",
		"Es smurf!",
		"No mms AMD",
		"Ya cargue 3 ultis en 1 min",
		"¿Cuantos kills es plata?",
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
	}, 500);

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
 * @param message - Message content
 * @param config - Raffle configuration
 * @returns Whether message qualifies
 */
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

	const isParticipating = keyword === messageText;

	// Ignore commands if configured
	return isParticipating;
}

/**
 * Checks if a message qualifies for raffle participation
 * @param content - Message content
 * @param config - Raffle configuration
 * @returns Whether message qualifies
 */
function checkUserRaffleParticipation(
	message: ChatMessage,
	config: RaffleConfig,
): boolean {
	let isParticipant = true;

	// Follower logic will not be implemented yet,
	// we need a way to bring them and use cache
	// since there's no reliable way to get them
	// from the message request, cache is a must.

	// Considering a Workers approach

	// if (config.followersOnly && !isFollower) {
	//     isParticipant = false;
	// }

	if (
		config.removeWinners &&
		chatStore.state.winners.some(
			(winner) => winner.userId === message.userId,
		)
	) {
		isParticipant = false;
	}

	if (
		config.ignoreMods &&
		message.badges.some((badge) => badge.setId === "moderator")
	) {
		isParticipant = false;
	}

	if (
		config.ignoreSubs &&
		message.badges.some((badge) => badge.setId === "subscriber")
	) {
		isParticipant = false;
	}

	if (
		config.ignoreVips &&
		message.badges.some((badge) => badge.setId === "vip")
	) {
		isParticipant = false;
	}

	return isParticipant;
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
 *
 * This sets isCapturing as true, this triggers
 * the filtering inside addChatMessage
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
 * Final state before picking winner
 */
export const rigTheRaffle = () => {
	chatStore.setState((state) => ({
		...state,
		isCapturing: false,
		isRaffleRigged: true,
	}));
};

/**
 * Executes raffle and selects winners
 * @returns Selected winners
 */
export const executeRaffle = (): RaffleParticipant => {
	chatStore.setState((state) => {
		const availableParticipants = state.raffleConfig.removeWinners
			? state.participants.filter((p) => !p.isWinner)
			: state.participants;

		// No participants available
		// Edge case, needs to be handled gracefully
		// If all participants are winners and
		// removeWinners is active (This is not handled)
		if (availableParticipants.length === 0) {
			return state;
		}

		const selectedWinner = selectRandomParticipant(availableParticipants);
		selectedWinner.isWinner = true;

		return {
			...state,
			winners: [...state.winners, selectedWinner],
			currentRound: state.currentRound + 1,
		};
	});

	console.log(chatStore.state.winners.at(-1));

	// biome-ignore lint/style/noNonNullAssertion: Need to make this clearer and avoid using !
	return chatStore.state.winners.at(-1)!;
};

/**
 * Selects random participants from available list
 * @param participants Available participants
 * @param count Number to select
 * @returns Selected participants
 */
function selectRandomParticipant(
	participants: RaffleParticipant[],
): RaffleParticipant {
	const config = chatStore.state.raffleConfig;

	const ticketPool: RaffleParticipant[] = [];

	participants.forEach((participant) => {
		ticketPool.push(participant);

		if (
			config.subsExtraTickets &&
			!config.ignoreSubs &&
			participant.badges.includes("subscriber")
		) {
			for (let i = 0; i < config.subsExtraValue; i++) {
				ticketPool.push(participant);
			}
		}

		if (
			config.vipsExtraTickets &&
			!config.ignoreVips &&
			participant.badges.includes("vip")
		) {
			for (let i = 0; i < config.vipsExtraValue; i++) {
				ticketPool.push(participant);
			}
		}
	});

	const randomArray = new Uint32Array(1);
	crypto.getRandomValues(randomArray);
	const randomIndex = randomArray[0] % ticketPool.length;

	return ticketPool[randomIndex];
}

/**
 * Clears the participants only
 */
export const clearParticipants = () => {
	chatStore.setState((state) => ({
		...state,
		// Will determine later if this function is justified
		participants: [],
	}));
};

/**
 * Resets raffle state for new raffle
 */
export const resetRaffle = () => {
	chatStore.setState((state) => ({
		...state,
		participants: [],
		winners: [],
		isCapturing: false,
		isRaffleRigged: false,
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
