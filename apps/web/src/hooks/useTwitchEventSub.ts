import { useRouteContext } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { EventSubChatMessage } from "@/lib/twitch-api-client";
import { authStore } from "@/stores/auth";
import {
	addChatMessage,
	CONNECTION_STATUS,
	chatStore,
	setConnectionStatus,
} from "@/stores/chat";

const MAX_RETRIES = Number(import.meta.env.VITE_MAX_RETRIES) || 5;
const BASE_RETRY_DELAY = Number(import.meta.env.VITE_BASE_RETRY_DELAY) || 1000;

/**
 * Hook for managing EventSub WebSocket connection and chat integration
 * Handles authentication, connection lifecycle, and chat message processing
 */
export function useTwitchEventSub() {
	// const eventSubRef = useRef<TwitchEventSubWebSocket | null>(null);
	const twitchAPI = useRouteContext({
		from: "__root__",
		select: (ctx) => ctx.twitchAPI,
	});
	const twitchEventSubWebSocket = useRouteContext({
		from: "__root__",
		select: (ctx) => ctx.twitchEventSubWebSocket,
	});
	const subscriptionIdRef = useRef<string | null>(null);

	// Retry logic state
	const retryCountRef = useRef(0);
	const retryTimeoutRef = useRef<number | null>(null);

	// This console log will be removed in beta, was used to track a re-render issue
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
	const isSwitchingChannel = useStore(
		chatStore,
		(state) => state.isSwitchingChannel,
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
			setConnectionStatus(CONNECTION_STATUS.CONNECTED);
			toast.success("🎮 Chat conectado", {
				description:
					"Conectado al chat de Twitch. ¡Los mensajes aparecerán en tiempo real!",
				duration: 4000,
				closeButton: true,
			});
		} else {
			setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
			toast.info("📡 Chat desconectado", {
				description: "Desconectado del chat de Twitch.",
				duration: 3000,
				closeButton: true,
			});
		}
	}, []);

	/**
	 * Schedules a retry attempt with exponential backoff
	 */
	const scheduleRetry = useCallback((errorMessage: string) => {
		console.log(`🔄 scheduleRetry called with error: ${errorMessage}`);

		// Clear any existing retry timeout
		if (retryTimeoutRef.current) {
			clearTimeout(retryTimeoutRef.current);
			retryTimeoutRef.current = null;
		}

		// Check if we should retry
		if (retryCountRef.current < MAX_RETRIES) {
			const retryDelay = BASE_RETRY_DELAY * 2 ** retryCountRef.current;
			retryCountRef.current += 1;

			console.log(
				`🔄 Scheduling retry attempt ${retryCountRef.current}/${MAX_RETRIES} in ${retryDelay}ms`,
			);
			setConnectionStatus(
				CONNECTION_STATUS.ERROR,
				`${errorMessage} (retry ${retryCountRef.current}/${MAX_RETRIES} in ${retryDelay / 1000}s)`,
			);

			retryTimeoutRef.current = window.setTimeout(() => {
				console.log(
					`🚀 Executing retry attempt ${retryCountRef.current} - setting status to disconnected`,
				);
				// Trigger reconnection by setting status to disconnected
				setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
			}, retryDelay);
		} else {
			console.error(
				`❌ Max retries (${MAX_RETRIES}) reached. Giving up.`,
			);
			setConnectionStatus(
				CONNECTION_STATUS.ERROR,
				`${errorMessage} - Max retries reached`,
			);
			retryCountRef.current = 0;

			toast.error("❌ Error de conexión", {
				description: `Error al conectar con Twitch: ${errorMessage}. Máximos reintentos alcanzados.`,
				duration: 8000,
				closeButton: true,
			});
		}
	}, []);

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
	 * Disconnects from EventSub WebSocket and clears references
	 * Nullify the ref after disconnect
	 */
	const disconnect = useCallback(async () => {
		if (twitchEventSubWebSocket) {
			await twitchEventSubWebSocket.disconnect();
		}

		subscriptionIdRef.current = null;
		setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
	}, [twitchEventSubWebSocket]);

	/**
	 * Establishes EventSub WebSocket connection and creates chat subscription
	 * Critical: Creates subscription within 10 seconds of session_welcome to avoid timeout
	 */
	const connect = useCallback(
		async (broadcasterId?: string) => {
			console.log("🚀 connect() called - checking auth state:", {
				isAuthenticated,
				hasUser: !!user,
				hasToken: !!accessToken,
				stack: new Error().stack, // ← ESTO nos dirá quién llama connect()
			});

			if (!isAuthenticated || !user || !accessToken) {
				setConnectionStatus(
					CONNECTION_STATUS.ERROR,
					"User not authenticated",
				);
				return;
			}

			if (twitchEventSubWebSocket.isConnected()) {
				console.log("🚫 Already connected, skipping connect()");
				return;
			}

			if (connectionStatus === CONNECTION_STATUS.CONNECTING) {
				console.log("🚫 Already connecting, skipping connect()");
				return;
			}

			const clientId = import.meta.env.VITE_CLIENT_ID;
			if (!clientId) {
				setConnectionStatus(
					CONNECTION_STATUS.ERROR,
					"VITE_CLIENT_ID not configured",
				);
				toast.error("⚙️ Configuración incorrecta", {
					description:
						"Necesitas tu clave de cliente Twitch para que funcione",
					duration: 8000,
					closeButton: true,
				});
				return;
			}

			try {
				setConnectionStatus(CONNECTION_STATUS.CONNECTING);

				// Not sure if we're going to use this
				// await twitchAPI.getCurrentUser();

				// Create fresh TwitchEventSubWebSocket
				// eventSubRef.current = new TwitchEventSubWebSocket();
				await twitchEventSubWebSocket.connect(
					handleChatMessage,
					handleConnectionChange,
					handleError,
				);

				const sessionId =
					await twitchEventSubWebSocket.waitForSessionWelcome();

				const subscriptionResponse =
					await twitchAPI.createChatMessageSubscription(
						sessionId,
						broadcasterId ?? user.id,
						user.id,
					);

				if (subscriptionResponse.data.length > 0) {
					subscriptionIdRef.current = subscriptionResponse.data[0].id;
					setConnectionStatus(CONNECTION_STATUS.CONNECTED);

					// Reset retry count on successful connection
					retryCountRef.current = 0;
					console.log("✅ Connection successful - retry count reset");

					setTimeout(() => diagnoseSubscriptions(), 2000);
				} else {
					throw new Error("Subscription response was empty");
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: "Connection failed";
				console.error("EventSub connection failed:", error);

				disconnect();

				// Retry logic
				scheduleRetry(errorMessage);
			}
		},
		[
			isAuthenticated,
			connectionStatus,
			user,
			accessToken,
			twitchAPI.createChatMessageSubscription,
			// twitchAPI.getCurrentUser,
			twitchEventSubWebSocket.connect,
			twitchEventSubWebSocket.isConnected,
			twitchEventSubWebSocket.waitForSessionWelcome,
			handleChatMessage,
			handleConnectionChange,
			handleError,
			diagnoseSubscriptions,
			scheduleRetry,
			disconnect,
		],
	);

	/**
	 * Toggles connection state between connected and disconnected
	 */
	const toggle = useCallback(() => {
		if (connectionStatus === CONNECTION_STATUS.CONNECTED) {
			disconnect();
		} else {
			connect();
		}
	}, [connectionStatus, connect, disconnect]);

	/**
	 * Auto-connects when user authentication is complete
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
				connectionStatus === CONNECTION_STATUS.DISCONNECTED,
		});

		if (
			isAuthenticated &&
			user &&
			accessToken &&
			connectionStatus === CONNECTION_STATUS.DISCONNECTED &&
			!twitchEventSubWebSocket.isConnected() &&
			!isSwitchingChannel
		) {
			console.log("✅ Auto-connect conditions met - calling connect()");
			connect();
		}
	}, [
		isAuthenticated,
		user,
		accessToken,
		connectionStatus,
		isSwitchingChannel,
		twitchEventSubWebSocket.isConnected,
		connect,
	]);

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
		isConnected: connectionStatus === CONNECTION_STATUS.CONNECTED,
		isConnecting: connectionStatus === CONNECTION_STATUS.CONNECTING,

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
