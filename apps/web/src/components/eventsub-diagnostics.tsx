import { useStore } from "@tanstack/react-store";
import { chatStore } from "@/stores/chat";

interface EventSubDiagnosticsProps {
	className?: string;
	// Props para evitar duplicar el hook
	sessionId: string | null;
	subscriptionId: string | null;
	isConnected: boolean;
	isConnecting: boolean;
}

// Función para colorear JSON
function syntaxHighlightJSON(json: string): string {
	return json.replace(
		/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
		(match) => {
			let cls = "text-orange-400"; // números
			if (/^"/.test(match)) {
				if (/:$/.test(match)) {
					cls = "text-blue-400"; // keys
				} else {
					cls = "text-green-400"; // strings
				}
			} else if (/true|false/.test(match)) {
				cls = "text-purple-400"; // booleans
			} else if (/null/.test(match)) {
				cls = "text-red-400"; // null
			}
			return `<span class="${cls}">${match}</span>`;
		},
	);
}

// Función para formatear uptime
function formatUptime(startTime: Date | null): string {
	if (!startTime) return "00:00:00";

	const now = new Date();
	const diff = now.getTime() - startTime.getTime();
	const seconds = Math.floor(diff / 1000) % 60;
	const minutes = Math.floor(diff / (1000 * 60)) % 60;
	const hours = Math.floor(diff / (1000 * 60 * 60));

	return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function EventSubDiagnostics({
	className = "",
	sessionId,
	subscriptionId,
	isConnected,
	isConnecting,
}: EventSubDiagnosticsProps) {
	const connectionStatus = useStore(
		chatStore,
		(state) => state.connectionStatus,
	);
	const connectionError = useStore(
		chatStore,
		(state) => state.connectionError,
	);
	const stats = useStore(chatStore, (state) => state.stats);

	// Datos de diagnóstico usando las props pasadas desde el componente padre
	const diagnosticData = {
		// 🔌 Connection Health
		connection: {
			status: connectionStatus,
			wsStatus: isConnected
				? "OPEN"
				: isConnecting
					? "CONNECTING"
					: "CLOSED",
			sessionId: sessionId || null,
			subscriptionId: subscriptionId || null,
			uptime: stats.captureStartTime
				? formatUptime(stats.captureStartTime)
				: "00:00:00",
			reconnectUrl: null, // TODO: Obtener de TwitchEventSubWebSocket
			lastError: connectionError,
		},

		// ⚡ Retry Logic Status
		retryStatus: {
			currentRetryCount: 0, // TODO: Obtener del hook
			maxRetries: 5,
			nextRetryIn: null,
			retryDelayPattern: "1s → 2s → 4s → 8s → 16s",
		},

		// 📡 Subscription Status
		subscriptions: {
			active: subscriptionId ? 1 : 0,
			failed: 0,
			subscriptionLatency: "N/A", // TODO: Calcular latencia real
			lastSubscriptionCreated: subscriptionId
				? new Date().toISOString()
				: null,
		},

		// 📈 Performance Metrics
		performance: {
			messagesReceived: stats.totalMessages,
			messagesPerSecond:
				stats.messagesPerMinute > 0
					? (stats.messagesPerMinute / 60).toFixed(1)
					: "0.0",
			averageLatency: "N/A", // TODO: Implementar tracking de latencia
			keepalivesMissed: 0, // TODO: Obtener de TwitchEventSubWebSocket
			lastMessageTimestamp:
				stats.totalMessages > 0 ? new Date().toISOString() : null,
			bufferHealth: isConnected ? "healthy" : "disconnected",
		},

		// 🚨 Error History (placeholder)
		errorHistory: connectionError
			? [
					{
						timestamp: new Date().toISOString(),
						type: "connection_error",
						message: connectionError,
						recovered: false,
					},
				]
			: [],
	};

	return (
		<div className={`col-span-20 bg-background ${className}`}>
			<div className="p-4">
				<h3 className="mb-2 font-semibold text-muted-foreground text-sm">
					Diagnóstico EventSub
				</h3>
				<pre className="max-h-200 overflow-auto rounded border border-slate-700 bg-slate-950 p-4 font-mono text-slate-300 text-xs">
					<code
						dangerouslySetInnerHTML={{
							__html: syntaxHighlightJSON(
								JSON.stringify(diagnosticData, null, 2),
							),
						}}
					/>
				</pre>
			</div>
		</div>
	);
}
