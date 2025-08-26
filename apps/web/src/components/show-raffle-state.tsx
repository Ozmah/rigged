import { useStore } from "@tanstack/react-store";
import { chatStore } from "@/stores/chat";
import { uiStore } from "@/stores/ui";

interface ShowRaffleStateProps {
	className?: string;
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

export function ShowRaffleState({ className = "" }: ShowRaffleStateProps) {
	const chatState = useStore(chatStore);

	// Filtrar datos sensibles y preparar para display
	const stateForDisplay = {
		connectionStatus: chatState.connectionStatus,
		connectionError: chatState.connectionError,
		messagesCount: chatState.messages.length,
		maxMessages: chatState.maxMessages,
		raffleConfig: chatState.raffleConfig,
		participants: chatState.participants.length,
		winners: chatState.winners.length,
		isCapturing: chatState.isCapturing,
		isRaffleRigged: chatState.isRaffleRigged,
		currentRound: chatState.currentRound,
		stats: chatState.stats,
		debug: chatState.debug,
	};

	return (
		<div className={`col-span-20 bg-background ${className}`}>
			<div className="p-4">
				<h3 className="mb-2 font-semibold text-muted-foreground text-sm">
					Datos de desarrollador
				</h3>
				<pre className="max-h-200 overflow-auto rounded border border-slate-700 bg-slate-950 p-4 font-mono text-slate-300 text-xs">
					<code
						dangerouslySetInnerHTML={{
							__html: syntaxHighlightJSON(
								JSON.stringify(stateForDisplay, null, 2),
							),
						}}
					/>
				</pre>
			</div>
		</div>
	);
}
