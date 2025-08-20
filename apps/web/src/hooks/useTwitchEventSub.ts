import { useRouteContext } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { EventSubChatMessage } from "@/lib/twitch-api-client";
import { TwitchEventSubWebSocket } from "@/lib/twitch-eventsub-client";
import { authStore } from "@/stores/auth";
import { addChatMessage, chatStore, setConnectionStatus } from "@/stores/chat";

/**
 * Hook for managing EventSub WebSocket connection and chat integration
 * Handles authentication, connection lifecycle, and chat message processing
 * PATTERN: Back to rigged2 working pattern - local instances, not singletons
 */
export function useTwitchEventSub() {
	// const eventSubRef = useRef<TwitchEventSubWebSocket | null>(null);
	const twitchAPI = useRouteContext({
		from: "/_twitchAuth",
		select: (ctx) => ctx.twitchAPI,
	});
	const twitchEventSubWebSocket = useRouteContext({
		from: "/_twitchAuth",
		select: (ctx) => ctx.twitchEventSubWebSocket,
	});
	const subscriptionIdRef = useRef<string | null>(null);

	// Retry logic state
	const retryCountRef = useRef(0);
	const retryTimeoutRef = useRef<number | null>(null);
	const maxRetries = 5;
	const baseRetryDelay = 1000; // 1 second

	// 🔍 DEBUG: Track what's causing re-renders
	const renderCount = useRef(0);
	renderCount.current += 1;
	console.log(`🔄 useTwitchEventSub render #${renderCount.current}`);

	// Auth Store
	const user = useStore(authStore, (state) => state.user);
	const accessToken = useStore(authStore, (state) => state.accessToken);
	const isAuthenticated = useStore(
		authStore,
		(state) => state.isAuthenticated,
	);
	const connectionStatus = useStore(
		chatStore,
		(state) => state.connectionStatus,
	);

	/**
	 * Processes incoming chat messages from EventSub WebSocket
	 */
	const handleChatMessage = useCallback((message: EventSubChatMessage) => {
		addChatMessage(message);
	}, []);

	/**
	 * Handles WebSocket connection state changes
	 */
	const handleConnectionChange = useCallback((connected: boolean) => {
		if (connected) {
			setConnectionStatus("connected");
			toast.success("🎮 Chat conectado", {
				description:
					"Conectado al chat de Twitch. ¡Los mensajes aparecerán en tiempo real!",
				duration: 4000,
			});
		} else {
			setConnectionStatus("disconnected");
			toast.info("📡 Chat desconectado", {
				description: "Desconectado del chat de Twitch.",
				duration: 3000,
			});
		}
	}, []);

	/**
	 * Schedules a retry attempt with exponential backoff
	 */
	const scheduleRetry = useCallback(
		(errorMessage: string) => {
			console.log(`🔄 scheduleRetry called with error: ${errorMessage}`);

			// Clear any existing retry timeout
			if (retryTimeoutRef.current) {
				clearTimeout(retryTimeoutRef.current);
				retryTimeoutRef.current = null;
			}

			// Check if we should retry
			if (retryCountRef.current < maxRetries) {
				const retryDelay =
					baseRetryDelay * Math.pow(2, retryCountRef.current);
				retryCountRef.current += 1;

				console.log(
					`🔄 Scheduling retry attempt ${retryCountRef.current}/${maxRetries} in ${retryDelay}ms`,
				);
				setConnectionStatus(
					"error",
					`${errorMessage} (retry ${retryCountRef.current}/${maxRetries} in ${retryDelay / 1000}s)`,
				);

				retryTimeoutRef.current = window.setTimeout(() => {
					console.log(
						`🚀 Executing retry attempt ${retryCountRef.current} - setting status to disconnected`,
					);
					// Trigger reconnection by setting status to disconnected
					setConnectionStatus("disconnected");
				}, retryDelay);
			} else {
				// Max retries reached - give up
				console.error(
					`❌ Max retries (${maxRetries}) reached. Giving up.`,
				);
				setConnectionStatus(
					"error",
					`${errorMessage} - Max retries reached`,
				);
				retryCountRef.current = 0; // Reset for future attempts

				toast.error("❌ Error de conexión", {
					description: `Error al conectar con Twitch: ${errorMessage}. Máximos reintentos alcanzados.`,
					duration: 8000,
				});
			}
		},
		[maxRetries, baseRetryDelay],
	);

	/**
	 * Handles EventSub connection errors
	 */
	const handleError = useCallback(
		(error: Error) => {
			console.error("EventSub error:", error);
			scheduleRetry(error.message);
		},
		[scheduleRetry],
	);

	/**
	 * Diagnoses and cleans up EventSub subscriptions
	 */
	const diagnoseSubscriptions = useCallback(async () => {
		if (!twitchAPI) return null;

		try {
			const subscriptions = await twitchAPI.getEventSubSubscriptions();

			const failedSubscriptions = subscriptions.data.filter(
				(sub) =>
					sub.status !== "enabled" &&
					sub.transport.method === "websocket",
			);

			for (const failedSub of failedSubscriptions) {
				try {
					await twitchAPI.deleteEventSubSubscription(failedSub.id);
				} catch (deleteError) {
					console.warn(
						`Failed to delete subscription ${failedSub.id}:`,
						deleteError,
					);
				}
			}

			return subscriptions;
		} catch (error) {
			console.error("Subscription diagnosis failed:", error);
			return null;
		}
	}, [twitchAPI]);

	/**
	 * Establishes EventSub WebSocket connection and creates chat subscription
	 * Critical: Creates subscription within 10 seconds of session_welcome to avoid timeout
	 * PATTERN: Creates fresh EventSubWebSocket instance like rigged2
	 */
	const connect = useCallback(async () => {
		console.log("🚀 connect() called - checking auth state:", {
			isAuthenticated,
			hasUser: !!user,
			hasToken: !!accessToken,
		});

		if (!isAuthenticated || !user || !accessToken) {
			setConnectionStatus("error", "User not authenticated");
			return;
		}

		if (twitchEventSubWebSocket.isConnected()) {
			return;
		}

		const clientId = import.meta.env.VITE_CLIENT_ID;
		if (!clientId) {
			setConnectionStatus("error", "VITE_CLIENT_ID not configured");
			toast.error("⚙️ Configuración incorrecta", {
				description:
					"Necesitas tu clave de cliente Twitch para que funcione",
				duration: 8000,
			});
			return;
		}

		try {
			setConnectionStatus("connecting");

			await twitchAPI.getCurrentUser();

			// Create fresh TwitchEventSubWebSocket instance (like rigged2)
			// eventSubRef.current = new TwitchEventSubWebSocket();
			await twitchEventSubWebSocket.connect(
				handleChatMessage,
				handleConnectionChange,
				handleError,
			);

			const sessionId = await twitchEventSubWebSocket.waitForSessionWelcome();

			const subscriptionResponse =
				await twitchAPI.createChatMessageSubscription(
					sessionId,
					user.id,
					user.id,
				);

			if (subscriptionResponse.data.length > 0) {
				subscriptionIdRef.current = subscriptionResponse.data[0].id;
				setConnectionStatus("connected");

				// Reset retry count on successful connection
				retryCountRef.current = 0;
				console.log("✅ Connection successful - retry count reset");

				setTimeout(() => diagnoseSubscriptions(), 2000);
			} else {
				throw new Error("Subscription response was empty");
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Connection failed";
			console.error("EventSub connection failed:", error);

			disconnect();

			// Use the retry logic instead of immediate error
			scheduleRetry(errorMessage);
		}
	}, [
		isAuthenticated,
		user,
		accessToken,
		handleChatMessage,
		handleConnectionChange,
		handleError,
		diagnoseSubscriptions,
		scheduleRetry,
	]);

	/**
	 * Cleanly disconnects from EventSub WebSocket and clears references
	 * PATTERN: Like rigged2 - nullify the ref after disconnect
	 */
	const disconnect = useCallback(() => {
		if (twitchEventSubWebSocket) {
			twitchEventSubWebSocket.disconnect();
		}

		subscriptionIdRef.current = null;
		setConnectionStatus("disconnected");
	}, []);

	/**
	 * Toggles connection state between connected and disconnected
	 */
	const toggle = useCallback(() => {
		if (connectionStatus === "connected") {
			disconnect();
		} else {
			connect();
		}
	}, [connectionStatus, connect, disconnect]);

	/**
	 * Auto-connects when user authentication is complete
	 * PATTERN: Same as rigged2 - this worked before, with retry logic
	 */
	useEffect(() => {
		console.log("🔄 useEffect triggered:", {
			isAuthenticated,
			hasUser: !!user,
			hasToken: !!accessToken,
			connectionStatus,
			shouldConnect:
				isAuthenticated &&
				user &&
				accessToken &&
				connectionStatus === "disconnected",
		});

		if (
			isAuthenticated &&
			user &&
			accessToken &&
			connectionStatus === "disconnected"
		) {
			console.log("✅ Conditions met - calling connect()");
			connect();
		}
	}, [isAuthenticated, user, accessToken, connectionStatus, connect]);

	/**
	 * Cleanup connections and retry timeouts on component unmount
	 */
	useEffect(() => {
		return () => {
			disconnect();
			// Clean up retry timeout
			if (retryTimeoutRef.current) {
				clearTimeout(retryTimeoutRef.current);
				retryTimeoutRef.current = null;
			}
		};
	}, [disconnect]);

	return {
		// Connection status
		connectionStatus,
		isConnected: connectionStatus === "connected",
		isConnecting: connectionStatus === "connecting",

		// Control functions
		connect,
		disconnect,
		toggle,

		// Debugging functions
		diagnoseSubscriptions,

		// Current session info
		sessionId: twitchEventSubWebSocket.getSessionId() || null,
		subscriptionId: subscriptionIdRef.current,
	};
}
