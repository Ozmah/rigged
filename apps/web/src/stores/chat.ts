import { Derived, Store } from "@tanstack/store";
import { toast } from "sonner";
import type { EventSubChatMessage } from "@/lib/twitch-api-client";
import { authStore } from "@/stores/auth";
import { uiStore, updateUiState } from "@/stores/ui";
// Types
import type { TwitchChannel } from "@/types/twitch-schemas";

export const MAX_MESSAGES = 100;
export const STATE_CONNECTION_STATUS_CONNECTED = "connected";

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
export const CONNECTION_STATUS = {
	DISCONNECTED: "disconnected",
	CONNECTING: "connecting",
	CONNECTED: "connected",
	ERROR: "error",
	RECONNECTING: "reconnecting",
} as const;

export type ConnectionStatus =
	(typeof CONNECTION_STATUS)[keyof typeof CONNECTION_STATUS];
/**
 * Raffle configurations saved to Local Storage
 */
export interface PersistedRaffleConfig {
	// Raffle options
	advanced: boolean;
	caseSensitive: boolean;
	removeWinners: boolean;
	followersOnly: boolean;
	subsExtraTickets: boolean;
	subsExtraValue: number;
	vipsExtraTickets: boolean;
	vipsExtraValue: number;
	ignoreStreamer: boolean;
	ignoreMods: boolean;
	ignoreSubs: boolean;
	ignoreVips: boolean;
	ticketValue: number;
	// General Options
	sendRaffleUpdates: boolean;
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
	isSwitchingChannel: boolean;
	currentChannel?: TwitchChannel;

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

// TODO: Add localStorage for settings specific to each channel, this will require a major overhaul

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
			ignoreStreamer: state.ignoreStreamer,
			ignoreMods: state.ignoreMods,
			ignoreSubs: state.ignoreSubs,
			ignoreVips: state.ignoreVips,
			ticketValue: state.ticketValue,
			sendRaffleUpdates: state.sendRaffleUpdates,
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
			ignoreStreamer: parsed.ignoreStreamer,
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
 * - isSwitchingChannel: false - Channel switching flag to prevent auto-connect during transitions
 * - currentChannel: undefined - No channel is connected initially
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
 * - ignoreStreamer: true - Streamer cannot participate in raffles by default
 * - ignoreMods: false - Moderators can participate in raffles by default
 * - ignoreSubs: false - Subscribers can participate in raffles by default
 * - ignoreVips: false - VIPs can participate in raffles by default
 * - ticketValue: 1 - Base ticket value for all participants
 * - sendRaffleUpdates: true - Messages to be sent to chat to update about the raffle (Optional for streamer only)
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
	connectionStatus: CONNECTION_STATUS.DISCONNECTED,
	connectionError: null,
	isSwitchingChannel: false,
	currentChannel: undefined,

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
		ignoreStreamer: true,
		ignoreMods: false,
		ignoreSubs: false,
		ignoreVips: false,
		ticketValue: 1,
		sendRaffleUpdates: true,
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
 *
 * Checks amount of messages stored and removes overflow, new messages are stored,
 *
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
		// This will eventually support all types of messages
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

		if (state.isCapturing) {
			if (state.raffleConfig.advanced) {
				const isMessageParticipating = checkMessageRaffleParticipation(
					message.content,
					state.raffleConfig,
				);

				const isUserParticipating = checkUserRaffleParticipation(
					message,
					state.raffleConfig,
				);

				message.isParticipant =
					isMessageParticipating && isUserParticipating;
			} else {
				message.isParticipant =
					state.raffleConfig.keyword.trim().toLowerCase() ===
					message.content.trim().toLowerCase();
			}
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

				if (chatStore.state.currentChannel && authStore.state.user) {
					authStore.state.TwitchAPI?.sendChatMessage(
						chatStore.state.currentChannel.broadcaster_id,
						authStore.state.user.id,
						`[Rigged Bot] ${participant.displayName} ahora está participando`,
					);
				}
			} else {
				message.isParticipant = false;
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
	const chatters: Record<string, string> = {
		47293851: "CarlosDMBot",
		92816374: "BrayamsBot",
		15647829: "EbrionBot",
		83529406: "ChecaBot",
		67401253: "RammsirisBot",
		29857463: "NavarritoBot",
	};

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
		const entries = Object.entries(chatters);
		const randomIndex = Math.floor(Math.random() * entries.length);
		const randomChatter = entries[randomIndex];
		const randomMessage =
			ALL_MESSAGES[Math.floor(Math.random() * ALL_MESSAGES.length)];
		const fakeMessage: EventSubChatMessage = {
			broadcaster_user_id: "77305523",
			broadcaster_user_login: "ozmah",
			broadcaster_user_name: "Ozmah",
			chatter_user_id: randomChatter[0],
			chatter_user_login: randomChatter[1].toLowerCase(),
			chatter_user_name: randomChatter[1],
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
			color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
			badges: [],
			message_type: "text",
			cheer: undefined,
			reply: undefined,
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

// This is going to be under heavy testing, it's related to a problem
// caused by using a keyword that might match an emote. Given the keyword "KeKw",
// if a user sends "KEKW" (To Twitch, this is just text, to BetterTTV -the twitch
// extension-, this is an emote), Twitch will send us something like "KEKW ͏",
// that translates, using the devtools, to "KEKW[SPACE][CGJ]":
//
// 1. U+0020 = Regular space after "KEKW"
// 2. U+034F = COMBINING GRAPHEME JOINER (CGJ)
//
// This is something we need to filter and we are experimenting with this function.

function cleanInvisibleChars(str: string): string {
	return (
		str
			.replace(
				// biome-ignore lint/suspicious/noControlCharactersInRegex: Production function that intentionally removes Unicode control characters to fix Twitch/BetterTTV emote interaction bug
				/[\u0000-\u001F\u007F-\u009F\u00A0\u200B-\u200D\u2060\uFEFF]/g,
				"",
			)
			// Remove combining characters separately (they combine with other characters)
			.replace(/\u034F/g, "")
			.replace(/\s+/g, " ")
			.trim()
	);
}

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
	const cleanMessage = cleanInvisibleChars(message);
	// Case sensitive logic
	const messageText = config.caseSensitive
		? cleanMessage
		: cleanMessage.toLowerCase();
	const keyword = config.caseSensitive
		? config.keyword.trim()
		: config.keyword.trim().toLowerCase();

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
		config.ignoreStreamer &&
		message.badges.some((badge) => badge.setId === "broadcaster")
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

	// Message format will change drastically, this is the first iteration
	if (chatStore.state.currentChannel && authStore.state.user) {
		authStore.state.TwitchAPI?.sendChatMessage(
			chatStore.state.currentChannel.broadcaster_id,
			authStore.state.user.id,
			`[Rigged Bot] ¡Rifa iniciada! Escribe "${chatStore.state.raffleConfig.keyword}"`,
		);
	}
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

	if (
		chatStore.state.currentChannel &&
		authStore.state.user &&
		chatStore.state.raffleConfig.sendRaffleUpdates
	) {
		authStore.state.TwitchAPI?.sendChatMessage(
			chatStore.state.currentChannel.broadcaster_id,
			authStore.state.user.id,
			"[Rigged Bot] ¡Ni uno más! Ya vamos a elegir al ganador",
		);
	}
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

/**
 * Resets chat state to initial values
 * Preserves: raffleConfig (user preferences)
 * Resets: messages, participants, winners, connection, stats
 */
export const resetChatState = (useUserSettings?: boolean) => {
	chatStore.setState((state) => ({
		...state,
		messages: [],

		raffleConfig: useUserSettings
			? { ...state.raffleConfig, ...loadPersistedRaffleConfigState() }
			: { ...state.raffleConfig, sendRaffleUpdates: true },

		participants: [],
		winners: [],
		isCapturing: false,
		isRaffleRigged: false,
		currentRound: 1,

		connectionStatus: CONNECTION_STATUS.DISCONNECTED,
		connectionError: null,

		stats: {
			totalMessages: 0,
			uniqueParticipants: 0,
			messagesPerMinute: 0,
			captureStartTime: undefined,
		},

		debug: {
			chatInterval: undefined,
			isChatGenerating: false,
		},

		// Careful with the preserved state, this is a
		// soft reset designed to preserve options and preferences
	}));
};

/**
 * Sets channel switching flag to prevent auto-connect during channel switch
 */
export const setChannelSwitching = (isSwitching: boolean) => {
	chatStore.setState((state) => ({
		...state,
		isSwitchingChannel: isSwitching,
	}));
};

/**
 * Sets the current channel we're connected to
 */
export const setCurrentChannel = (channel: TwitchChannel) => {
	chatStore.setState((state) => ({
		...state,
		currentChannel: channel,
	}));
};

/* 	This is the first part of a refactor of all UI and State actions,
	most of the logic has been abstracted and is based off of all these state "flags",
	this allows us to expand and use any action in the sistem from anywhere without
	prop drilling. Next part consist on bringing the heavy logic from the stand alone
	functions such as executeRaffle into the raffleStateActions object, at the moment
	the functions inside this object are already a part of the flow but they are basically
	calling the legacy functions internally, the intent is to bring that and remove legacy
	functions.
*/
export interface RaffleStateActions {
	/*** Raffle Core Actions ***/
	updateKeyword: (keyword: string) => void;
	startRaffle: () => void;
	stopRaffle: () => void;
	rigRaffle: () => void;
	executeRaffle: () => RaffleParticipant | null;
	clearParticipants: () => void;

	/*** Configuration Actions ***/
	toggleAdvanced: (enabled: boolean) => void;
	toggleIgnoreMods: (enabled: boolean) => void;
	toggleIgnoreSubs: (enabled: boolean) => void;
	toggleIgnoreVips: (enabled: boolean) => void;
	toggleCaseSensitive: (enabled: boolean) => void;
	toggleRemoveWinners: (enabled: boolean) => void;
	toggleSubsExtraTickets: (enabled: boolean) => void;
	toggleVipsExtraTickets: (enabled: boolean) => void;
	toggleRaffleUpdates: (enabled: boolean) => void;
	updateSubsExtraValue: (value: number) => void;
	updateVipsExtraValue: (value: number) => void;

	/*** Dev Tools Actions ***/
	startTestMessages: () => void;
	stopTestMessages: () => void;
	clearChatMessages: () => void;

	/*** UI State Actions ***/
	openCancelDialog: () => void;
	closeCancelDialog: () => void;
	confirmCancelRaffle: () => void;
	hideRaffleControls: () => void;
	showRaffleControls: () => void;

	/*** Keyboard Actions ***/
	keywordEnterPressed: () => void;
}

export const raffleStateActions: RaffleStateActions = {
	/*** Raffle Core Actions ***/
	updateKeyword: (keyword: string) => {
		updateRaffleConfig({ keyword });
	},

	startRaffle: () => {
		updateUiState({ hideRaffleControls: true });
		startRaffleCapture();
		toast.success("Comenzamos!", {
			description: `Capturando participantes con la palabra "${chatStore.state.raffleConfig.keyword}"`,
			duration: 3000,
		});
	},

	stopRaffle: () => {
		const participants = chatStore.state.participants;
		if (participants.length > 0) {
			updateUiState({ showCancelDialog: true });
		} else {
			updateUiState({ hideRaffleControls: false });
			stopRaffleCapture();
			toast.info("Rifa Cancelada", {
				duration: 3000,
			});
		}
	},

	rigRaffle: () => {
		rigTheRaffle();
	},

	executeRaffle: () => {
		let winner = null;

		const config = chatStore.state.raffleConfig;
		const state = chatStore.state;
		const allParticipantsAreWinnersReactive =
			config.advanced &&
			config.removeWinners &&
			state.participants.length === state.winners.length &&
			state.participants.length > 0;

		if (!allParticipantsAreWinnersReactive) {
			chatStore.setState((state) => {
				const availableParticipants = state.raffleConfig.removeWinners
					? state.participants.filter((p) => !p.isWinner)
					: state.participants;

				if (availableParticipants.length === 0) {
					return state;
				}

				const selectedWinner = selectRandomParticipant(
					availableParticipants,
				);
				selectedWinner.isWinner = true;

				return {
					...state,
					winners: [...state.winners, selectedWinner],
					currentRound: state.currentRound + 1,
				};
			});

			if (chatStore.state.currentChannel && authStore.state.user) {
				authStore.state.TwitchAPI?.sendChatMessage(
					chatStore.state.currentChannel.broadcaster_id,
					authStore.state.user.id,
					`[Rigged Bot] ¡Felicidades! Ganador: ${chatStore.state.winners.at(-1)?.displayName}`,
				);
			}
		}

		if (chatStore.state.winners.length > 0) {
			// biome-ignore lint/style/noNonNullAssertion: Need to make this clearer and avoid using !
			winner = chatStore.state.winners.at(-1)!;
		}

		if (winner && !allParticipantsAreWinnersReactive) {
			toast.success("¡Felicidades!", {
				description: `Ganador: ${winner.displayName}`,
				duration: 8000,
				closeButton: true,
			});
		} else if (winner && allParticipantsAreWinnersReactive) {
			return winner;
		} else {
			toast.error("❌ Hubo un problema con el sorteo", {
				duration: 4000,
				closeButton: true,
			});
		}
		return winner;
	},

	clearParticipants: () => {
		clearParticipants();
	},

	/*** Configuration Actions ***/
	toggleAdvanced: (enabled: boolean) => {
		updateRaffleConfig({ advanced: enabled });
	},

	toggleIgnoreMods: (enabled: boolean) => {
		updateRaffleConfig({ ignoreMods: enabled });
	},

	toggleIgnoreSubs: (enabled: boolean) => {
		updateRaffleConfig({ ignoreSubs: enabled });
	},

	toggleIgnoreVips: (enabled: boolean) => {
		updateRaffleConfig({ ignoreVips: enabled });
	},

	toggleCaseSensitive: (enabled: boolean) => {
		updateRaffleConfig({ caseSensitive: enabled });
	},

	toggleRemoveWinners: (enabled: boolean) => {
		updateRaffleConfig({ removeWinners: enabled });
	},

	toggleSubsExtraTickets: (enabled: boolean) => {
		updateRaffleConfig({ subsExtraTickets: enabled });
	},

	toggleVipsExtraTickets: (enabled: boolean) => {
		updateRaffleConfig({ vipsExtraTickets: enabled });
	},

	toggleRaffleUpdates: (enabled: boolean) => {
		updateRaffleConfig({ sendRaffleUpdates: enabled });
	},

	updateSubsExtraValue: (value: number) => {
		updateRaffleConfig({ subsExtraValue: value });
	},

	updateVipsExtraValue: (value: number) => {
		updateRaffleConfig({ vipsExtraValue: value });
	},

	/*** Dev Tools Actions ***/
	startTestMessages: () => {
		startTestMessageGeneration();
		toast.success("Generando Mensajes", {
			description: "Creando mensajes para simular rifas",
			duration: 3000,
			closeButton: true,
		});
	},

	stopTestMessages: () => {
		stopTestMessageGeneration();
		toast.info("Mensajes detenidos", {
			duration: 3000,
			closeButton: true,
		});
	},

	clearChatMessages: () => {
		clearChatMessages();
	},

	/*** UI State Actions ***/
	openCancelDialog: () => {
		updateUiState({ showCancelDialog: true });
	},

	closeCancelDialog: () => {
		updateUiState({ showCancelDialog: false });
	},

	confirmCancelRaffle: () => {
		const raffleWinners = chatStore.state.winners;
		stopRaffleCapture();
		resetRaffle();
		updateUiState({ hideRaffleControls: false });
		const raffleStatus = raffleWinners.length ? "Terminada" : "Cancelada";
		toast.info(`Rifa ${raffleStatus}`, {
			duration: 3000,
			closeButton: true,
		});
	},

	hideRaffleControls: () => {
		updateUiState({ hideRaffleControls: true });
	},

	showRaffleControls: () => {
		updateUiState({ hideRaffleControls: false });
	},

	/*** Keyboard Actions ***/
	keywordEnterPressed: () => {
		if (canStartRaffle.state) {
			raffleStateActions.startRaffle();
		}
	},
};

/**
 * Derived state for computed values that depend on store state
 * These replace the inline computations that were in the SettingsPanel component
 */

/*** Connection and validation ***/
export const isConnected = new Derived({
	fn: () => chatStore.state.connectionStatus === CONNECTION_STATUS.CONNECTED,
	deps: [chatStore],
});

export const hasValidKeyword = new Derived({
	fn: () => {
		const keyword = chatStore.state.raffleConfig.keyword;
		return keyword && keyword.trim() !== "";
	},
	deps: [chatStore],
});

export const canStartRaffle = new Derived({
	fn: () => isConnected.state && hasValidKeyword.state,
	deps: [isConnected, hasValidKeyword],
});

export const isThisMyStream = new Derived({
	fn: () => {
		if (
			!authStore.state.user?.id ||
			!chatStore.state.currentChannel?.broadcaster_id
		)
			return false;
		return (
			authStore.state.user.id ===
			chatStore.state.currentChannel.broadcaster_id
		);
	},
	deps: [authStore, chatStore],
});

/*** Raffle state ***/
export const isRaffleActive = new Derived({
	fn: () => chatStore.state.isCapturing || chatStore.state.isRaffleRigged,
	deps: [chatStore],
});

export const hasParticipants = new Derived({
	fn: () => chatStore.state.participants.length > 0,
	deps: [chatStore],
});

export const hasWinners = new Derived({
	fn: () => chatStore.state.winners.length > 0,
	deps: [chatStore],
});

/*** Advanced configuration ***/
export const allParticipantsAreWinners = new Derived({
	fn: () => {
		const config = chatStore.state.raffleConfig;
		const state = chatStore.state;

		return (
			config.advanced &&
			config.removeWinners &&
			state.participants.length === state.winners.length &&
			state.participants.length > 0
		);
	},
	deps: [chatStore],
});

export const showSubsExtraTickets = new Derived({
	fn: () => {
		const config = chatStore.state.raffleConfig;
		return !config.ignoreSubs && config.subsExtraTickets;
	},
	deps: [chatStore],
});

export const showVipsExtraTickets = new Derived({
	fn: () => {
		const config = chatStore.state.raffleConfig;
		return !config.ignoreVips && config.vipsExtraTickets;
	},
	deps: [chatStore],
});

/*** Button state ***/
// This might need to change based on the bug of the mobile sheet
// at the moment this still needs testing such as starting a raffle
// on mobile, exit de menu, wait for participants to happen and observe
// this particular state.
export const primaryButtonText = new Derived({
	fn: () => {
		const state = chatStore.state;
		if (state.isCapturing) return "Cancelar Rifa";
		if (state.isRaffleRigged) {
			return hasWinners.state ? "Terminar Rifa" : "Cancelar Rifa";
		}
		return "Iniciar Rifa";
	},
	deps: [chatStore, hasWinners],
});

export const primaryButtonVariant = new Derived({
	fn: () => {
		const state = chatStore.state;
		return state.isCapturing || state.isRaffleRigged
			? "outline"
			: "default";
	},
	deps: [chatStore],
});

export const secondaryButtonText = new Derived({
	fn: () => {
		const participants = chatStore.state.participants.length;
		const state = chatStore.state;

		if (participants === 0) return "Sin participantes";
		if (
			state.raffleConfig.removeWinners &&
			participants === chatStore.state.winners.length
		)
			return "Todos ganaron ya";
		if (state.isRaffleRigged) {
			return hasWinners.state
				? "¿Elegir otro ganador?"
				: "¡Elegir un ganador!";
		}
		return "¡Siguiente paso!";
	},
	deps: [chatStore, hasWinners],
});

export const secondaryButtonDisabled = new Derived({
	fn: () => {
		const state = chatStore.state;
		return (
			(!state.isCapturing && !state.isRaffleRigged) ||
			state.participants.length === 0
		);
	},
	deps: [chatStore],
});

// The following derived state is extremely redundant,
// making uiStore basically boilerplate, I intent
// to separate this monster of a store into smaller
// pieces, so bear with me.

/*** UI state (combining chat and ui stores) ***/
export const showCancelDialog = new Derived({
	fn: () => uiStore.state.showCancelDialog,
	deps: [uiStore],
});

export const hideRaffleControls = new Derived({
	fn: () => uiStore.state.hideRaffleControls,
	deps: [uiStore],
});

export const microMenuSelected = new Derived({
	fn: () => uiStore.state.microMenuSelected,
	deps: [uiStore],
});

/*** Dev tools ***/
export const isGeneratingMessages = new Derived({
	fn: () => chatStore.state.debug.isChatGenerating,
	deps: [chatStore],
});

export const testMessagesButtonText = new Derived({
	fn: () => (isGeneratingMessages.state ? "Detener" : "Generar Mensajes"),
	deps: [isGeneratingMessages],
});

export const testMessagesButtonVariant = new Derived({
	fn: () => (isGeneratingMessages.state ? "secondary" : "default"),
	deps: [isGeneratingMessages],
});
