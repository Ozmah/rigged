import { useStore } from "@tanstack/react-store";
import { useEffect } from "react";
import { authStore } from "@/stores/auth";
import { chatStore, isThisMyStream } from "@/stores/chat";

// Coloring JSON
function syntaxHighlightJSON(json: string): string {
	return json.replace(
		/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
		(match) => {
			let cls = "text-orange-400"; // numbers
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

export function ShowRaffleState() {
	const shouldAnonymize = import.meta.env.VITE_ANON_DEBUG === "1";
	const chatState = useStore(chatStore);
	const authState = useStore(authStore);

	const isThisMyStreamState = useStore(isThisMyStream);

	useEffect(() => {
		const unsubscribers = [isThisMyStream.mount()];

		return () => {
			for (const unsub of unsubscribers) {
				unsub();
			}
		};
	}, []);

	type AnonUser = {
		id: string;
		login: string;
		displayName: string;
		email?: string;
	};

	function anonymizeUser(user: AnonUser) {
		if (!shouldAnonymize) return user;

		return {
			...user,
			id: "******",
			login: "******",
			displayName: user.displayName,
			email: user.email ? "******" : null,
		};
	}

	type AnonChannel = {
		id: string;
		login: string;
		name: string;
	};

	function anonymizeChannel(channel: AnonChannel) {
		if (!shouldAnonymize) return channel;

		return {
			...channel,
			id: "******",
			login: "******",
			name: channel.name,
		};
	}

	const stateForDisplay = [
		{
			// 🔐 Auth State
			title: "Authentication",
			isAuthenticated: authState.isAuthenticated,
			user: authState.user
				? anonymizeUser({
						id: authState.user.id,
						login: authState.user.login,
						displayName: authState.user.display_name,
						email: authState.user.email,
					})
				: null,
			modedChannelsCount: authState.modedChannels?.length || 0,
			hasAccessToken: !!authState.accessToken,
			"[DER]isThisMyStream": isThisMyStreamState,
		},
		{
			// 🔌 Connection State
			title: "Connection",
			connectionStatus: chatState.connectionStatus,
			connectionError: chatState.connectionError,
			currentChannel: chatState.currentChannel
				? anonymizeChannel(chatState.currentChannel)
				: null,
			messagesCount: chatState.messages.length,
			maxMessages: chatState.maxMessages,
			isSwitchingChannel: chatState.isSwitchingChannel,
		},
		{
			// 🎲 Raffle State
			title: "Raffle",
			raffleConfig: chatState.raffleConfig,
			participants: chatState.participants.length,
			winners: chatState.winners.length,
			isCapturing: chatState.isCapturing,
			isRaffleRigged: chatState.isRaffleRigged,
			currentRound: chatState.currentRound,
		},
		{
			// 📊 Stats & Debug
			title: "Stats & Debug",
			stats: chatState.stats,
			debug: chatState.debug,
		},
	];

	return (
		<div className="flex flex-col">
			<h3 className="p-4 font-semibold text-muted-foreground text-sm">
				Full App State
			</h3>
			<div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
				{stateForDisplay.map((stateColumn) => {
					const { title, ...stateData } = stateColumn;
					return (
						<div
							key={title.toLowerCase()}
							className="rounded-lg bg-indigo-900/20"
						>
							<div className="p-2">
								<h4 className="mb-2 font-semibold text-blue-400 text-xs">
									{title}
								</h4>
								<pre className="max-h-[40vh] overflow-auto rounded border border-slate-700 bg-slate-950 p-3 font-mono text-slate-300 text-xs">
									<code
										// Telling biome to ignore this, there's no danger on coloring JSON.
										// biome-ignore lint/security/noDangerouslySetInnerHtml: Safe controlled JSON syntax highlighting for diagnostics
										dangerouslySetInnerHTML={{
											__html: syntaxHighlightJSON(
												JSON.stringify(
													stateData,
													null,
													2,
												),
											),
										}}
									/>
								</pre>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
