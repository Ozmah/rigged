import { authStore, clearAuth } from "@/stores/auth";
import {
	type ChattersResponse,
	type ModeratedChannelsResponse,
	type SendChatMessage,
	SendChatMessageResponseSchema,
	type TokenValidation,
	TokenValidationSchema,
	TwitchModeratedChannelsResponseSchema,
	type TwitchUser,
	TwitchUsersResponseSchema,
} from "../types/twitch-schemas";

export interface TwitchAPIConfig {
	baseURL: string;
	clientId: string;
}

export interface AuthUrlParams {
	clientId: string;
	redirectUri: string;
	scopes: string[];
	state?: string;
}

export interface AuthCallbackResult {
	user: TwitchUser;
	accessToken: string;
	state: string;
	tokenValidation: TokenValidation;
}

export interface AuthError {
	type:
		| "oauth_error"
		| "token_validation_error"
		| "user_fetch_error"
		| "missing_token"
		| "network_error";
	message: string;
	details?: unknown;
}

export type MessageType =
	| "text"
	| "channel_points_highlighted"
	| "channel_points_sub_only"
	| "user_intro"
	| "power_ups_message_effect"
	| "power_ups_gigantified_emote";

export const RIGGED_SCOPES = [
	"user:read:email",
	"user:read:chat",
	"user:write:chat",
	"user:read:moderated_channels",
	"user:bot",
	"channel:bot",
] as const;

export interface EventSubMessage {
	metadata: {
		message_id: string;
		message_type:
			| "session_welcome"
			| "session_keepalive"
			| "notification"
			| "session_reconnect"
			| "revocation";
		message_timestamp: string;
		subscription_type?: string;
		subscription_version?: string;
	};
	payload: {
		session?: {
			id: string;
			status: string;
			connected_at: string;
			keepalive_timeout_seconds: number;
			reconnect_url?: string;
		};
		subscription?: {
			id: string;
			status: string;
			type: string;
			version: string;
			condition: Record<string, string>;
			transport: {
				method: string;
				session_id: string;
			};
			created_at: string;
		};
		event?: EventSubChatMessage;
	};
}

export interface EventSubChatMessage {
	broadcaster_user_id: string;
	broadcaster_user_login: string;
	broadcaster_user_name: string;
	chatter_user_id: string;
	chatter_user_login: string;
	chatter_user_name: string;
	message_id: string;
	message: {
		text: string;
		fragments: Array<{
			type: "text" | "cheermote" | "emote" | "mention";
			text: string;
			cheermote?: {
				prefix: string;
				bits: number;
				tier: number;
			};
			emote?: {
				id: string;
				emote_set_id: string;
				format: string[];
			};
			mention?: {
				user_id: string;
				user_name: string;
				user_login: string;
			};
		}>;
	};
	color: string;
	badges: Array<{
		set_id: string;
		id: string;
		info: string;
	}>;
	message_type: MessageType;
	cheer?: {
		bits: number;
	};
	reply?: {
		parent_message_id: string;
		parent_message_body: string;
		parent_user_id: string;
		parent_user_name: string;
		parent_user_login: string;
		thread_message_id: string;
		thread_user_id: string;
		thread_user_name: string;
		thread_user_login: string;
	};
	channel_points_custom_reward_id?: string;
}

interface TwitchApiErrorData {
	message?: string;
	error?: string;
	error_description?: string;
	[key: string]: unknown;
}

export class TwitchAPI {
	private config: TwitchAPIConfig;

	constructor() {
		this.config = {
			baseURL: "https://api.twitch.tv/helix",
			clientId: import.meta.env.VITE_CLIENT_ID,
		};
	}

	/**
	 * Generates a Twitch OAuth authorization URL
	 */
	createTwitchAuthUrl(params: AuthUrlParams): string {
		const { clientId, redirectUri, scopes, state } = params;

		const authUrl = new URL("https://id.twitch.tv/oauth2/authorize");
		authUrl.searchParams.set("client_id", clientId);
		authUrl.searchParams.set("redirect_uri", redirectUri);
		authUrl.searchParams.set("response_type", "token");
		authUrl.searchParams.set("scope", scopes.join(" "));
		authUrl.searchParams.set("state", state || crypto.randomUUID());

		return authUrl.toString();
	}

	/**
	 * Validates a Twitch access token and returns parsed validation data
	 */
	async validateTwitchToken(
		accessToken: string,
	): Promise<TokenValidation | false> {
		// These AI console logs are going away when we hit beta
		console.log("🌐 === VALIDATE TWITCH TOKEN EXECUTING ===");
		console.log(
			"🎫 Access token:",
			accessToken
				? `${accessToken.substring(0, 10)}...`
				: "null/undefined",
		);

		try {
			console.log("📡 Making request to Twitch validation endpoint...");
			const response = await fetch(
				"https://id.twitch.tv/oauth2/validate",
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			console.log(
				"📊 Response status:",
				response.status,
				response.statusText,
			);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				console.error(
					`Token validation failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`,
				);
				return false;
			}

			const data = await response.json();
			console.log("✅ Raw response data:", data);

			const validatedData = TokenValidationSchema.parse(data);
			console.log("✅ Validated data:", validatedData);

			return validatedData;
		} catch (error) {
			console.error("💥 validateTwitchToken error:", error);
			if (error instanceof Error) {
				console.error(`Token validation error: ${error.message}`);
			} else {
				console.error("Unknown token validation error");
			}

			return false;
		}
	}

	/**
	 * Fetches authenticated user data from Twitch API
	 */
	async fetchTwitchUser(accessToken: string): Promise<TwitchUser> {
		try {
			const response = await fetch("https://api.twitch.tv/helix/users", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Client-Id": this.config.clientId,
				},
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(
					`User fetch failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`,
				);
			}

			const data = await response.json();

			const validatedResponse = TwitchUsersResponseSchema.parse(data);

			if (validatedResponse.data.length === 0) {
				throw new Error("No user data returned from Twitch API");
			}

			return validatedResponse.data[0];
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`User fetch error: ${error.message}`);
			}
			throw new Error("Unknown user fetch error");
		}
	}

	/**
	 * Parses OAuth callback URL to extract tokens or error information
	 */
	parseAuthCallback(url: string): {
		accessToken: string | null;
		state: string | null;
		error: string | null;
		errorDescription: string | null;
	} {
		const urlObj = new URL(url);

		// Success: http://localhost:3000/#access_token=73d0f8mkabpbmjp921asv2jaidwxn
		const hashParams = new URLSearchParams(urlObj.hash.substring(1));
		const accessToken = hashParams.get("access_token");
		const state = hashParams.get("state");

		// Error: http://localhost:3000/?error=access_denied
		const searchParams = new URLSearchParams(urlObj.search);
		const error = searchParams.get("error");
		const errorDescription = searchParams.get("error_description");

		return {
			accessToken,
			state,
			error,
			errorDescription,
		};
	}

	/**
	 * Executes complete authentication flow: token validation + user data fetch
	 */
	async completeAuthFlow(accessToken: string): Promise<AuthCallbackResult> {
		try {
			const tokenValidation = await this.validateTwitchToken(accessToken);

			if (!tokenValidation) {
				throw new Error("Token validation failed");
			}

			const user = await this.fetchTwitchUser(accessToken);

			return {
				user,
				accessToken,
				state: "",
				tokenValidation,
			};
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			}
			throw new Error("Unknown authentication error");
		}
	}

	/**
	 * Creates a structured authentication error object
	 */
	createAuthError(
		type: AuthError["type"],
		message: string,
		details?: unknown,
	): AuthError {
		return {
			type,
			message,
			details,
		};
	}

	/**
	 * Validates required environment variables for authentication
	 */
	validateAuthEnvironment(): {
		clientId: string;
		redirectUri: string;
	} {
		const clientId = this.config.clientId;

		if (!clientId) {
			throw new Error(
				"VITE_CLIENT_ID environment variable is not configured",
			);
		}

		// This either needs to be added to .env
		// or a more elegant way to do it
		const redirectUri = `${window.location.origin}/callback`;

		return { clientId, redirectUri };
	}

	/**
	 * Initiates Twitch OAuth login by redirecting to authorization URL
	 */
	async initiateTwitchLogin(): Promise<void> {
		const { clientId, redirectUri } = this.validateAuthEnvironment();

		console.log(`CLIENT ID: ${clientId}`);
		console.log(`REDIRECT URI: ${redirectUri}`);

		const authUrl = this.createTwitchAuthUrl({
			clientId,
			redirectUri,
			scopes: [...RIGGED_SCOPES],
			state: crypto.randomUUID(),
		});

		window.location.href = authUrl;
	}

	/**
	 * Handles OAuth callback processing
	 */
	async handleAuthCallback(): Promise<AuthCallbackResult> {
		const { accessToken, state, error, errorDescription } =
			this.parseAuthCallback(window.location.href);

		// Check for OAuth errors
		if (error) {
			throw this.createAuthError(
				"oauth_error",
				`OAuth error: ${errorDescription || error}`,
			);
		}

		// Check for missing token
		if (!accessToken) {
			throw this.createAuthError(
				"missing_token",
				"No access token received from Twitch",
			);
		}

		// Complete the auth flow
		try {
			const result = await this.completeAuthFlow(accessToken);
			return {
				...result,
				state: state || "",
			};
		} catch (error) {
			if (error instanceof Error) {
				throw this.createAuthError(
					"token_validation_error",
					error.message,
					error,
				);
			}
			throw this.createAuthError(
				"network_error",
				"Unknown authentication error",
			);
		}
	}

	/**
	 * Clears authentication state and logs out user
	 */
	logout(): void {
		clearAuth();
	}

	// ================================
	// 🔧 PRIVATE UTILITY METHODS
	// ================================

	/**
	 * Makes authenticated request to Twitch API with error handling
	 * Uses authStore.state.accessToken for authentication
	 */
	private async request<T>(
		endpoint: string,
		params?: Record<string, string>,
	): Promise<T> {
		const url = new URL(`${this.config.baseURL}${endpoint}`);
		const accessToken = authStore.state.accessToken;

		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				url.searchParams.set(key, value);
			});
		}

		if (!accessToken) {
			throw new Error("Twitch API Error: no valid access token");
		}

		const response = await fetch(url.toString(), {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Client-Id": this.config.clientId,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				`Twitch API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`,
			);
		}

		return response.json();
	}

	/**
	 * Posts data to Twitch API endpoint with error handling
	 * Uses authStore.state.accessToken for authentication
	 */
	private async post<T>(endpoint: string, data: unknown): Promise<T> {
		const accessToken = authStore.state.accessToken;
		const response = await fetch(`${this.config.baseURL}${endpoint}`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Client-Id": this.config.clientId,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));

			throw this.createApiError(endpoint, response.status, errorData);
		}

		return response.json();
	}

	private createApiError(
		endpoint: string,
		status: number,
		errorData: unknown,
	): Error {
		const endpointName = this.getEndpointName(endpoint);

		const statusMessages: Record<number, string> = {
			400: "Bad Request: Invalid parameters",
			401: "Unauthorized: Invalid or expired token",
			403: "Forbidden: Insufficient permissions",
			404: "Not Found: Resource doesn't exist",
			409: "Conflict: Resource already exists",
			422: "Unprocessable Entity: Invalid data",
			429: "Rate Limited: Too many requests",
			500: "Internal Server Error: Server issues",
		};

		const baseMessage = statusMessages[status] || `API Error (${status})`;

		// Message extraction
		let errorMessage = "";

		if (errorData && typeof errorData === "object") {
			const typedErrorData = errorData as TwitchApiErrorData;
			errorMessage =
				typedErrorData.message ||
				typedErrorData.error ||
				typedErrorData.error_description ||
				"";
		} else if (typeof errorData === "string") {
			errorMessage = errorData;
		}

		// Fallback to JSON if no readable message
		if (!errorMessage && errorData) {
			errorMessage = JSON.stringify(errorData);
		}

		const fullMessage = errorMessage
			? `${endpointName} ${baseMessage}: ${errorMessage}`
			: `${endpointName} ${baseMessage}`;

		const error = new Error(fullMessage);

		// Add debugging properties with proper typing
		Object.assign(error, {
			status,
			endpoint,
			errorData,
		});

		return error;
	}

	private getEndpointName(endpoint: string): string {
		const endpointNames: Record<string, string> = {
			"/eventsub/subscriptions": "EventSub",
			"/chat/messages": "Chat Message",
			"/users": "Users",
			"/moderation/channels": "Moderation Channels",
			"/chat/chatters": "Chat Chatters",
			"/chat/emotes": "Chat Emotes",
			"/chat/emotes/global": "Global Emotes",
			"/chat/badges": "Chat Badges",
			"/chat/badges/global": "Global Badges",
			"/chat/emotes/set": "Emote Sets",
			"/subscriptions/user": "User Subscription",
			"/shared_chat/session": "Shared Chat Session",
			"/moderation/bans": "Moderation Bans",
		};

		return endpointNames[endpoint] || "Twitch API";
	}

	// ================================
	// 👤 USER & CHANNEL METHODS
	// ================================

	/**
	 * Gets current authenticated user data with Zod validation
	 * Uses authStore.state.accessToken for authentication
	 */
	async getCurrentUser(): Promise<TwitchUser> {
		const response = await this.request("/users");
		const validatedResponse = TwitchUsersResponseSchema.parse(response);
		if (validatedResponse.data.length === 0) {
			throw new Error("No user data returned from Twitch API");
		}
		return validatedResponse.data[0];
	}

	async getModedChannels(userId: string): Promise<ModeratedChannelsResponse> {
		// This is to bring 100 channels, we might need an implementation of "after"
		// and a constant to make this 100 non magical
		const params: Record<string, string> = {
			user_id: userId,
			first: "100",
		};
		const response = await this.request("/moderation/channels", params);
		const validatedResponse =
			TwitchModeratedChannelsResponseSchema.parse(response);

		// This validation is not needed for the time being
		// if (validatedResponse.data.length === 0) {
		// 	throw new Error("User had no moded channels");
		// }

		return validatedResponse;
	}

	// ================================
	// 💬 CHAT & EVENTSUB METHODS
	// ================================

	/**
	 * Gets chatters in a channel with Zod validation
	 * Requires moderator:read:chatters scope
	 */
	async getChatters(
		_broadcasterId: string,
		_moderatorId: string,
		_first = 100,
	): Promise<ChattersResponse> {
		// TODO: Implement - Get list of users connected to chat
		// - Use this.request() with /chat/chatters endpoint
		// - Validate response with ChattersResponseSchema
		// - Handle pagination if needed
		throw new Error("Method not implemented yet");
	}

	/**
	 * Gets all EventSub subscriptions for debugging
	 */

	// Need to make a type for this horrid thing
	async getEventSubSubscriptions(): Promise<{
		data: Array<{
			id: string;
			status: string;
			type: string;
			version: string;
			condition: Record<string, string>;
			transport: {
				method: string;
				session_id?: string;
				connected_at?: string;
				disconnected_at?: string;
			};
			created_at: string;
			cost: number;
		}>;
		total: number;
		total_cost: number;
		max_total_cost: number;
	}> {
		return this.request("/eventsub/subscriptions");
	}

	/**
	 * Creates EventSub subscription for chat messages
	 */
	async createChatMessageSubscription(
		sessionId: string,
		broadcasterId: string,
		userId: string,
	): Promise<{ data: Array<{ id: string; status: string; type: string }> }> {
		if (!sessionId?.trim() || !broadcasterId?.trim() || !userId?.trim()) {
			throw new Error(
				"Session ID, broadcaster ID, and user ID are required",
			);
		}
		if (!/^\d+$/.test(broadcasterId) || !/^\d+$/.test(userId)) {
			throw new Error("Broadcaster ID and user ID must be numeric");
		}
		const subscriptionData = {
			type: "channel.chat.message",
			version: "1",
			condition: {
				broadcaster_user_id: broadcasterId,
				user_id: userId,
			},
			transport: {
				method: "websocket",
				session_id: sessionId,
			},
		};
		return this.post<{
			data: Array<{ id: string; status: string; type: string }>;
		}>("/eventsub/subscriptions", subscriptionData);
	}

	/**
	 * Sends a message to a broadcaster's chat room
	 *
	 * Requires user:write:chat scope. When using app access token, additionally requires
	 * user:bot scope from chatting user and either channel:bot scope from broadcaster
	 * or moderator status.
	 *
	 * @param broadcasterId The ID of the broadcaster whose chat room the message will be sent to
	 * @param senderId The ID of the user sending the message. Must match the user ID in the access token
	 * @param message The message to send. Limited to 500 characters maximum. Can include emoticons using their names (case sensitive, no colons)
	 * @param replyId Optional ID of the chat message being replied to
	 * @param sourceOnly Whether to send only to source channel during shared chat session. Defaults to true. Only works with App Access tokens, we have User Access tokens.
	 * @returns Promise resolving to message result containing message_id, is_sent status, and optional drop_reason
	 * @throws Error when message fails validation, user lacks permissions, or API request fails
	 */
	async sendChatMessage(
		broadcasterId: string,
		senderId: string,
		message: string,
		replyId?: string,
		// sourceOnly = true,
	): Promise<SendChatMessage> {
		const params = {
			broadcaster_id: broadcasterId,
			sender_id: senderId,
			message: message,
			reply_parent_message_id: replyId,
			// for_source_only: sourceOnly,
		};

		const response = await this.post("/chat/messages", params);
		const validatedResponse = SendChatMessageResponseSchema.parse(response);

		if (validatedResponse.data.length === 0) {
			throw new Error("No user data returned from Twitch API");
		}

		return validatedResponse.data[0];
	}

	/**
	 * Deletes an EventSub subscription
	 */
	async deleteEventSubSubscription(subscriptionId: string): Promise<void> {
		const accessToken = authStore.state.accessToken;
		const response = await fetch(
			`${this.config.baseURL}/eventsub/subscriptions?id=${subscriptionId}`,
			{
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Client-Id": this.config.clientId,
				},
			},
		);
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				`Failed to delete subscription: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`,
			);
		}
	}

	// ================================
	// 😀 EMOTES & BADGES METHODS
	// ================================

	/**
	 * Gets channel-specific emotes for the broadcaster
	 */
	// async getChannelEmotes(_broadcasterId: string): Promise<any> {
	// TODO: Implement - Get custom emotes for specific channel
	// - Use this.request() with /chat/emotes endpoint
	// - Include broadcaster_id parameter
	// - Return emotes with images and metadata
	// throw new Error("Method not implemented yet");
	// }

	/**
	 * Gets global Twitch emotes (Kappa, PogChamp, etc.)
	 */
	// async getGlobalEmotes(): Promise<any> {
	// TODO: Implement - Get global Twitch emotes
	// - Use this.request() with /chat/emotes/global endpoint
	// - Return classic Twitch emotes available in all chats
	// throw new Error("Method not implemented yet");
	// }

	/**
	 * Gets channel-specific chat badges
	 */
	// async getChannelBadges(_broadcasterId: string): Promise<any> {
	// TODO: Implement - Get custom badges for specific channel
	// - Use this.request() with /chat/badges endpoint
	// - Include broadcaster_id parameter
	// - Return badge sets with versions and images
	// throw new Error("Method not implemented yet");
	// }

	/**
	 * Gets global Twitch chat badges
	 */
	// async getGlobalBadges(): Promise<any> {
	// TODO: Implement - Get global Twitch badges
	// - Use this.request() with /chat/badges/global endpoint
	// - Return global badge sets available in all chats
	// throw new Error("Method not implemented yet");
	// }

	/**
	 * Gets emotes from specific emote sets
	 */
	// async getEmoteSets(_emoteSetIds: string[]): Promise<any> {
	// TODO: Implement - Get emotes from specific sets
	// - Use this.request() with /chat/emotes/set endpoint
	// - Include emote_set_id parameters (max 25)
	// - Return emotes grouped by set
	// throw new Error("Method not implemented yet");
	// }

	// ================================
	// 🔮 FUTURE METHODS PLACEHOLDERS
	// ================================

	/**
	 * Checks if user is subscribed to a channel
	 */
	// async checkUserSubscription(
	// 	_broadcasterId: string,
	// 	_userId: string,
	// ): Promise<any> {
	// TODO: Implement - Check user subscription status
	// - Use this.request() with /subscriptions/user endpoint
	// - Requires user:read:subscriptions scope
	// - Return subscription details or null if not subscribed
	// 	throw new Error("Method not implemented yet");
	// }

	/**
	 * Gets shared chat session information
	 */
	// async getSharedChatSession(_broadcasterId: string): Promise<any> {
	// TODO: Implement - Get shared chat session info
	// - Use this.request() with /shared_chat/session endpoint
	// - Return session participants and metadata
	// 	throw new Error("Method not implemented yet");
	// }
}
