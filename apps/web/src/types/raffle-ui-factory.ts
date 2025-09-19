// Raffle Core Actions
interface UpdateKeywordAction {
	type: "UPDATE_KEYWORD";
	payload: {
		keyword: string;
	};
}

interface StartRaffleAction {
	type: "START_RAFFLE";
}

interface StopRaffleAction {
	type: "STOP_RAFFLE";
}

interface RigRaffleAction {
	type: "RIG_RAFFLE";
}

interface ExecuteRaffleAction {
	type: "EXECUTE_RAFFLE";
}

interface ClearParticipantsAction {
	type: "CLEAR_PARTICIPANTS";
}

// Configuration Actions
interface ToggleAdvancedAction {
	type: "TOGGLE_ADVANCED";
	payload: {
		enabled: boolean;
	};
}

interface ToggleIgnoreModsAction {
	type: "TOGGLE_IGNORE_MODS";
	payload: {
		enabled: boolean;
	};
}

interface ToggleIgnoreSubsAction {
	type: "TOGGLE_IGNORE_SUBS";
	payload: {
		enabled: boolean;
	};
}

interface ToggleIgnoreVipsAction {
	type: "TOGGLE_IGNORE_VIPS";
	payload: {
		enabled: boolean;
	};
}

interface ToggleCaseSensitiveAction {
	type: "TOGGLE_CASE_SENSITIVE";
	payload: {
		enabled: boolean;
	};
}

interface ToggleRemoveWinnersAction {
	type: "TOGGLE_REMOVE_WINNERS";
	payload: {
		enabled: boolean;
	};
}

interface ToggleSubsExtraTicketsAction {
	type: "TOGGLE_SUBS_EXTRA_TICKETS";
	payload: {
		enabled: boolean;
	};
}

interface ToggleVipsExtraTicketsAction {
	type: "TOGGLE_VIPS_EXTRA_TICKETS";
	payload: {
		enabled: boolean;
	};
}

interface ToggleRaffleUpdatesAction {
	type: "TOGGLE_RAFFLE_UPDATES";
	payload: {
		enabled: boolean;
	};
}

interface UpdateSubsExtraValueAction {
	type: "UPDATE_SUBS_EXTRA_VALUE";
	payload: {
		value: number;
	};
}

interface UpdateVipsExtraValueAction {
	type: "UPDATE_VIPS_EXTRA_VALUE";
	payload: {
		value: number;
	};
}

// Dev Tools Actions
interface StartTestMessagesAction {
	type: "START_TEST_MESSAGES";
}

interface StopTestMessagesAction {
	type: "STOP_TEST_MESSAGES";
}

interface ClearChatMessagesAction {
	type: "CLEAR_CHAT_MESSAGES";
}

// UI State Actions
interface OpenCancelDialogAction {
	type: "OPEN_CANCEL_DIALOG";
}

interface CloseCancelDialogAction {
	type: "CLOSE_CANCEL_DIALOG";
}

interface ConfirmCancelRaffleAction {
	type: "CONFIRM_CANCEL_RAFFLE";
}

interface HideRaffleControlsAction {
	type: "HIDE_RAFFLE_CONTROLS";
}

interface ShowRaffleControlsAction {
	type: "SHOW_RAFFLE_CONTROLS";
}

// Keyboard Actions
interface KeywordEnterPressedAction {
	type: "KEYWORD_ENTER_PRESSED";
}

// Union type for all raffle UI actions
export type RaffleUiAction =
	| UpdateKeywordAction
	| StartRaffleAction
	| StopRaffleAction
	| RigRaffleAction
	| ExecuteRaffleAction
	| ClearParticipantsAction
	| ToggleAdvancedAction
	| ToggleIgnoreModsAction
	| ToggleIgnoreSubsAction
	| ToggleIgnoreVipsAction
	| ToggleCaseSensitiveAction
	| ToggleRemoveWinnersAction
	| ToggleSubsExtraTicketsAction
	| ToggleVipsExtraTicketsAction
	| ToggleRaffleUpdatesAction
	| UpdateSubsExtraValueAction
	| UpdateVipsExtraValueAction
	| StartTestMessagesAction
	| StopTestMessagesAction
	| ClearChatMessagesAction
	| OpenCancelDialogAction
	| CloseCancelDialogAction
	| ConfirmCancelRaffleAction
	| HideRaffleControlsAction
	| ShowRaffleControlsAction
	| KeywordEnterPressedAction;

// Action factory
export const createRaffleUiAction = {
	/*********** RAFFLE CORE ACTIONS ***********/
	updateKeyword: (keyword: string): UpdateKeywordAction => ({
		type: "UPDATE_KEYWORD",
		payload: { keyword },
	}),

	startRaffle: (): StartRaffleAction => ({
		type: "START_RAFFLE",
	}),

	stopRaffle: (): StopRaffleAction => ({
		type: "STOP_RAFFLE",
	}),

	rigRaffle: (): RigRaffleAction => ({
		type: "RIG_RAFFLE",
	}),

	executeRaffle: (): ExecuteRaffleAction => ({
		type: "EXECUTE_RAFFLE",
	}),

	clearParticipants: (): ClearParticipantsAction => ({
		type: "CLEAR_PARTICIPANTS",
	}),

	/*********** CONFIGURATION ACTIONS ***********/
	toggleAdvanced: (enabled: boolean): ToggleAdvancedAction => ({
		type: "TOGGLE_ADVANCED",
		payload: { enabled },
	}),

	toggleIgnoreMods: (enabled: boolean): ToggleIgnoreModsAction => ({
		type: "TOGGLE_IGNORE_MODS",
		payload: { enabled },
	}),

	toggleIgnoreSubs: (enabled: boolean): ToggleIgnoreSubsAction => ({
		type: "TOGGLE_IGNORE_SUBS",
		payload: { enabled },
	}),

	toggleIgnoreVips: (enabled: boolean): ToggleIgnoreVipsAction => ({
		type: "TOGGLE_IGNORE_VIPS",
		payload: { enabled },
	}),

	toggleCaseSensitive: (enabled: boolean): ToggleCaseSensitiveAction => ({
		type: "TOGGLE_CASE_SENSITIVE",
		payload: { enabled },
	}),

	toggleRemoveWinners: (enabled: boolean): ToggleRemoveWinnersAction => ({
		type: "TOGGLE_REMOVE_WINNERS",
		payload: { enabled },
	}),

	toggleSubsExtraTickets: (
		enabled: boolean,
	): ToggleSubsExtraTicketsAction => ({
		type: "TOGGLE_SUBS_EXTRA_TICKETS",
		payload: { enabled },
	}),

	toggleVipsExtraTickets: (
		enabled: boolean,
	): ToggleVipsExtraTicketsAction => ({
		type: "TOGGLE_VIPS_EXTRA_TICKETS",
		payload: { enabled },
	}),

	toggleRaffleUpdates: (enabled: boolean): ToggleRaffleUpdatesAction => ({
		type: "TOGGLE_RAFFLE_UPDATES",
		payload: { enabled },
	}),

	updateSubsExtraValue: (value: number): UpdateSubsExtraValueAction => ({
		type: "UPDATE_SUBS_EXTRA_VALUE",
		payload: { value },
	}),

	updateVipsExtraValue: (value: number): UpdateVipsExtraValueAction => ({
		type: "UPDATE_VIPS_EXTRA_VALUE",
		payload: { value },
	}),

	/*********** DEV TOOLS ACTIONS ***********/
	startTestMessages: (): StartTestMessagesAction => ({
		type: "START_TEST_MESSAGES",
	}),

	stopTestMessages: (): StopTestMessagesAction => ({
		type: "STOP_TEST_MESSAGES",
	}),

	clearChatMessages: (): ClearChatMessagesAction => ({
		type: "CLEAR_CHAT_MESSAGES",
	}),

	/*********** UI STATE ACTIONS ***********/
	openCancelDialog: (): OpenCancelDialogAction => ({
		type: "OPEN_CANCEL_DIALOG",
	}),

	closeCancelDialog: (): CloseCancelDialogAction => ({
		type: "CLOSE_CANCEL_DIALOG",
	}),

	confirmCancelRaffle: (): ConfirmCancelRaffleAction => ({
		type: "CONFIRM_CANCEL_RAFFLE",
	}),

	hideRaffleControls: (): HideRaffleControlsAction => ({
		type: "HIDE_RAFFLE_CONTROLS",
	}),

	showRaffleControls: (): ShowRaffleControlsAction => ({
		type: "SHOW_RAFFLE_CONTROLS",
	}),

	/*********** KEYBOARD ACTIONS ***********/
	keywordEnterPressed: (): KeywordEnterPressedAction => ({
		type: "KEYWORD_ENTER_PRESSED",
	}),
};
