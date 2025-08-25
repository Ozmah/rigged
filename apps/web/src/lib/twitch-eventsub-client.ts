// EventSub WebSocket constants
const EVENTSUB_KEEPALIVE_TIMEOUT_SECONDS = 5;
const EVENTSUB_KEEPALIVE_BUFFER_SECONDS = 10;
const EVENTSUB_SESSION_WELCOME_TIMEOUT_MS = 15000;

// EventSub WebSocket message types
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

// EventSub chat message event
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
	message_type:
		| "text"
		| "channel_points_highlighted"
		| "channel_points_sub_only"
		| "user_intro";
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

/**
 * EventSub WebSocket connection manager
 * Handles real-time chat message subscriptions via WebSocket
 */
export class TwitchEventSubWebSocket {
	private ws: WebSocket | null = null;
	private sessionId: string | null = null;
	private keepaliveTimeoutId: number | null = null;
	private reconnectUrl: string | null = null;
	private sessionWelcomeReceived = false;
	private sessionWelcomePromise: Promise<string> | null = null;
	private sessionWelcomeResolve?: (sessionId: string) => void;
	private sessionWelcomeReject?: (error: Error) => void;

	private onMessageCallback?: (message: EventSubChatMessage) => void;
	private onConnectionCallback?: (connected: boolean) => void;
	private onErrorCallback?: (error: Error) => void;

	/**
	 * Connects to EventSub WebSocket
	 * @param onMessage - Callback for chat messages
	 * @param onConnection - Callback for connection status
	 * @param onError - Callback for errors
	 */
	async connect(
		onMessage: (message: EventSubChatMessage) => void,
		onConnection: (connected: boolean) => void,
		onError: (error: Error) => void,
	): Promise<void> {
		this.onMessageCallback = onMessage;
		this.onConnectionCallback = onConnection;
		this.onErrorCallback = onError;

		// Reset session state
		this.sessionId = null;
		this.sessionWelcomeReceived = false;

		// Create promise for session_welcome with timeout
		this.sessionWelcomePromise = new Promise<string>((resolve, reject) => {
			this.sessionWelcomeResolve = resolve;
			this.sessionWelcomeReject = reject;

			setTimeout(() => {
				if (!this.sessionWelcomeReceived) {
					reject(
						new Error(
							"Timeout waiting for session_welcome message",
						),
					);
				}
			}, EVENTSUB_SESSION_WELCOME_TIMEOUT_MS);
		});

		const wsUrl = this.reconnectUrl || "wss://eventsub.wss.twitch.tv/ws";

		try {
			this.ws = new WebSocket(wsUrl);
			this.setupEventListeners();
		} catch (error) {
			this.onErrorCallback?.(new Error(`Failed to connect: ${error}`));
		}
	}

	/**
	 * Sets up WebSocket event listeners for EventSub connection
	 */
	private setupEventListeners(): void {
		if (!this.ws) return;

		this.ws.onopen = () => {
			console.log("EventSub WebSocket connected");
		};

		this.ws.onmessage = (event) => {
			try {
				const message: EventSubMessage = JSON.parse(event.data);
				this.handleEventSubMessage(message);
			} catch (error) {
				console.error("Failed to parse EventSub message:", error);
				this.onErrorCallback?.(new Error("Failed to parse message"));
			}
		};

		this.ws.onclose = (event) => {
			console.log("EventSub WebSocket closed:", event.code, event.reason);

			if (
				!this.reconnectUrl ||
				!this.onMessageCallback ||
				!this.onConnectionCallback ||
				!this.onErrorCallback
			) {
				return;
			}

			if (event.code === 4003) {
				console.error(
					"ERROR 4003: Connection unused - subscription not created within 10 seconds",
				);
				this.onErrorCallback?.(
					new Error(
						"Subscription timeout: Failed to create subscription within 10 seconds",
					),
				);
				return;
			}

			if (!this.sessionWelcomeReceived && this.sessionWelcomeReject) {
				this.sessionWelcomeReject(
					new Error(
						`WebSocket closed before session_welcome: ${event.code} ${event.reason}`,
					),
				);
			}

			this.onConnectionCallback?.(false);

			if (event.code !== 1000) {
				// Snapshot of functions to avoid noNonNullAssertion
				const messageCallback = this.onMessageCallback;
				const connectionCallback = this.onConnectionCallback;
				const errorCallback = this.onErrorCallback;
				setTimeout(() => {
					if (this.reconnectUrl) {
						this.connect(
							messageCallback,
							connectionCallback,
							errorCallback,
						);
					}
				}, 3000);
			}
		};

		this.ws.onerror = (error) => {
			console.error("EventSub WebSocket error:", error);

			// Reject session welcome promise if still pending
			if (!this.sessionWelcomeReceived && this.sessionWelcomeReject) {
				this.sessionWelcomeReject(
					new Error("WebSocket connection error"),
				);
			}

			this.onErrorCallback?.(new Error("WebSocket connection error"));
		};
	}

	/**
	 * Handles incoming EventSub messages
	 * @param message - EventSub message
	 */
	private handleEventSubMessage(message: EventSubMessage): void {
		console.log(message.metadata.message_type);
		switch (message.metadata.message_type) {
			case "session_welcome":
				this.sessionId = message.payload.session?.id || null;
				this.sessionWelcomeReceived = true;

				this.setupKeepalive(
					message.payload.session?.keepalive_timeout_seconds ||
						EVENTSUB_KEEPALIVE_TIMEOUT_SECONDS,
				);

				if (this.sessionId && this.sessionWelcomeResolve) {
					this.sessionWelcomeResolve(this.sessionId);
				} else if (this.sessionWelcomeReject) {
					this.sessionWelcomeReject(
						new Error("No session ID in session_welcome"),
					);
				}

				this.onConnectionCallback?.(true);
				break;

			case "session_keepalive":
				console.log("Received keepalive - resetting timeout");
				this.setupKeepalive(EVENTSUB_KEEPALIVE_TIMEOUT_SECONDS);
				break;

			case "notification":
				if (
					message.payload.event &&
					message.metadata.subscription_type ===
						"channel.chat.message"
				) {
					console.log(
						"Received chat message notification - calling message callback",
					);
					this.onMessageCallback?.(message.payload.event);
				}
				// CRITICAL FIX: Reset keepalive timeout on ANY message, including notifications
				console.log(
					"Notification received - resetting keepalive timeout",
				);
				this.setupKeepalive(EVENTSUB_KEEPALIVE_TIMEOUT_SECONDS);
				break;

			case "session_reconnect":
				this.reconnectUrl =
					message.payload.session?.reconnect_url || null;
				this.disconnect();
				break;

			case "revocation":
				this.onErrorCallback?.(new Error("Subscription was revoked"));
				break;

			default:
				console.warn(
					"Unknown EventSub message type:",
					message.metadata.message_type,
				);
		}
	}

	/**
	 * Sets up keepalive timeout monitoring
	 * @param timeoutSeconds - Timeout in seconds
	 */
	private setupKeepalive(timeoutSeconds: number): void {
		// Clear existing timeout
		if (this.keepaliveTimeoutId) {
			clearTimeout(this.keepaliveTimeoutId);
			this.keepaliveTimeoutId = null;
		}

		// Only setup keepalive if we have an active WebSocket connection
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			console.warn(
				"Skipping keepalive setup - WebSocket not in OPEN state",
			);
			return;
		}

		// Add buffer to the timeout
		this.keepaliveTimeoutId = window.setTimeout(
			() => {
				// Double-check connection state before reconnecting
				if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
					console.log(
						"Keepalive timeout fired but WebSocket already closed - skipping reconnect",
					);
					return;
				}

				// Validate we still have the required callbacks
				if (
					!this.onMessageCallback ||
					!this.onConnectionCallback ||
					!this.onErrorCallback
				) {
					console.warn(
						"Keepalive timeout fired but callbacks are missing - skipping reconnect",
					);
					return;
				}

				console.warn("EventSub keepalive timeout - reconnecting");

				// Store callbacks before disconnect (they might get cleared)
				const messageCallback = this.onMessageCallback;
				const connectionCallback = this.onConnectionCallback;
				const errorCallback = this.onErrorCallback;

				this.disconnect();
				this.connect(
					messageCallback,
					connectionCallback,
					errorCallback,
				);
			},
			(timeoutSeconds + EVENTSUB_KEEPALIVE_BUFFER_SECONDS) * 1000,
		);

		console.log(
			`Keepalive timeout set for ${timeoutSeconds + EVENTSUB_KEEPALIVE_BUFFER_SECONDS} seconds`,
		);
	}

	/**
	 * Gets the current session ID
	 * @returns Session ID or null if not connected
	 */
	getSessionId(): string | null {
		return this.sessionId;
	}

	/**
	 * Waits for the session_welcome message and returns the session ID
	 * @returns Promise that resolves with the session ID
	 */
	async waitForSessionWelcome(): Promise<string> {
		if (this.sessionWelcomeReceived && this.sessionId) {
			return this.sessionId;
		}

		if (!this.sessionWelcomePromise) {
			throw new Error(
				"No session welcome promise available - connection not initiated",
			);
		}

		return this.sessionWelcomePromise;
	}

	/**
	 * Disconnects from EventSub WebSocket
	 */
	disconnect(): void {
		if (this.keepaliveTimeoutId) {
			clearTimeout(this.keepaliveTimeoutId);
			this.keepaliveTimeoutId = null;
		}

		if (this.ws) {
			this.ws.close(1000, "Client disconnect");
			this.ws = null;
		}

		this.sessionId = null;
		this.reconnectUrl = null;
	}

	/**
	 * Checks if WebSocket is connected
	 * @returns Connection status
	 */
	isConnected(): boolean {
		return this.ws?.readyState === WebSocket.OPEN;
	}
}
