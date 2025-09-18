import { toast } from "sonner";
import { resetChatState, setChannelSwitching } from "@/stores/chat";
import { resetUIState } from "@/stores/ui";
import type { TwitchAPI } from "./twitch-api-client";
import type { SettingsPanelProps } from "@/components/raffle/settings-panel";

/**
 * Switches to a different Twitch channel
 * Resets all app state except auth and user preferences
 */
export const switchToChannel = async (
	broadcasterId: string,
	broadcasterName: string,
	props: SettingsPanelProps,
	twitchAPI: TwitchAPI,
) => {
	console.log("🔄 Starting channel switch to:", {
		broadcasterId,
		broadcasterName,
	});

	try {
		// 🚫 Block auto-connect during channel switch
		setChannelSwitching(true);

		console.log("📡 Disconnecting current EventSub...");
		await props.eventSubHook.disconnect();

		const prevSubscriptionId = props.eventSubHook.subscriptionId;

		console.log("AFTER DISCONNECT");
		console.log(props.eventSubHook);

		if (prevSubscriptionId) {
			console.log(
				"🗑️ Deleting previous subscription:",
				prevSubscriptionId,
			);
			try {
				await twitchAPI.deleteEventSubSubscription(prevSubscriptionId);
				console.log("✅ Previous subscription deleted successfully");
			} catch (deleteError) {
				console.warn(
					"⚠️ Failed to delete previous subscription:",
					deleteError,
				);
			}
		}

		// 3️⃣ THEN: Reset app states (after disconnect to avoid auto-reconnect)
		console.log("📝 Resetting app state...");
		resetChatState();
		resetUIState();

		// 4️⃣ FINALLY: Connect to new channel
		console.log("🎯 Connecting to new channel...");
		await props.eventSubHook.connect(broadcasterId);

		toast.success("🎯 Canal cambiado", {
			description: `Conectado a ${broadcasterName}`,
			duration: 3000,
			closeButton: true,
		});

		console.log("✅ Channel switch completed successfully");

		// ✅ Re-enable auto-connect
		setChannelSwitching(false);
	} catch (error) {
		// ✅ Re-enable auto-connect even on error
		setChannelSwitching(false);
		console.error("❌ Channel switch failed:", error);

		toast.error("❌ Error al cambiar canal", {
			description:
				error instanceof Error ? error.message : "Error desconocido",
			duration: 5000,
			closeButton: true,
		});

		throw error;
	}
};
