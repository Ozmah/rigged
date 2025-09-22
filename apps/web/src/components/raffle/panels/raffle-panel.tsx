// Framework Specific/Hooks/Providers/Functional Components

// UI/Styles/UI Components
import { CaretDownIcon, EraserIcon } from "@phosphor-icons/react";
import { useStore } from "@tanstack/react-store";
import { useEffect, useId } from "react";
import { DisabledOverlay } from "@/components/disabled-overlay";
import { NumberInput } from "@/components/number-input";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FloatingInput } from "@/components/ui/floating-input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TooltipInfo } from "@/components/ui/tooltip-info";
import { TypographyH4, TypographyMuted } from "@/components/ui/typography";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
// Libs
import { handleRaffleAction } from "@/lib/raffle-action-handler";
// Types/Store State
import {
	canStartRaffle,
	chatStore,
	hideRaffleControls,
	primaryButtonText,
	primaryButtonVariant,
	secondaryButtonDisabled,
	secondaryButtonText,
	showSubsExtraTickets,
	showVipsExtraTickets,
} from "@/stores/chat";
import { createRaffleUiAction } from "@/types/raffle-ui-factory";

interface RafflePanel {
	className?: string;
}

export function RafflePanel({ className = "" }: RafflePanel) {
	const device = useDeviceDetection();
	const baseId = useId();
	const raffleConfig = useStore(chatStore, (state) => state.raffleConfig);
	const hasParticipants = useStore(
		chatStore,
		(state) => state.participants.length > 0,
	);
	const isCapturing = useStore(chatStore, (state) => state.isCapturing);
	const isRaffleRigged = useStore(chatStore, (state) => state.isRaffleRigged);
	const showDropdownMenuState = isCapturing && hasParticipants;

	// Derived state
	const canStartRaffleState = useStore(canStartRaffle);

	const hideRaffleControlsState = useStore(hideRaffleControls);
	const primaryButtonTextState = useStore(primaryButtonText);
	const primaryButtonVariantState = useStore(primaryButtonVariant);
	const secondaryButtonTextState = useStore(secondaryButtonText);
	const secondaryButtonDisabledState = useStore(secondaryButtonDisabled);
	const showSubsExtraTicketsState = useStore(showSubsExtraTickets);
	const showVipsExtraTicketsState = useStore(showVipsExtraTickets);

	// Mount all derived state
	useEffect(() => {
		const unsubscribers = [
			canStartRaffle.mount(),
			hideRaffleControls.mount(),
			primaryButtonText.mount(),
			primaryButtonVariant.mount(),
			secondaryButtonText.mount(),
			secondaryButtonDisabled.mount(),
			showSubsExtraTickets.mount(),
			showVipsExtraTickets.mount(),
		];

		return () => {
			for (const unsub of unsubscribers) {
				unsub();
			}
		};
	}, []);

	// Helper for field IDs
	const createFieldId = (name: string) => `${baseId}-${name}`;

	// Field IDs
	const keywordId = createFieldId("keyword");
	const advancedId = createFieldId("advanced");
	const ignoreModsId = createFieldId("ignoreMods");
	const ignoreSubsId = createFieldId("ignoreSubs");
	const ignoreVipsId = createFieldId("ignoreVips");
	const caseSensitiveId = createFieldId("caseSensitive");
	const removeWinnersId = createFieldId("removeWinners");
	const subsExtraTicketsId = createFieldId("subsExtraTickets");
	const vipsExtraTicketsId = createFieldId("vipsExtraTickets");

	return (
		<>
			<section className={`space-y-4 ${className}`}>
				<div className="space-y-4">
					{!device.isMobile && (
						<div className="">
							<TypographyH4>Ajustes de la Rifa</TypographyH4>
						</div>
					)}
					{/* Key Word */}
					<div className="">
						<FloatingInput
							id={keywordId}
							label="Palabra clave"
							value={raffleConfig.keyword}
							onKeyUp={(
								e: React.KeyboardEvent<HTMLInputElement>,
							) => {
								if (e.key === "Enter") {
									handleRaffleAction(
										createRaffleUiAction.keywordEnterPressed(),
									);
								}
							}}
							onChange={(keyword: string) => {
								handleRaffleAction(
									createRaffleUiAction.updateKeyword(keyword),
								);
							}}
							placeholder="Ej: puroprimo"
							disabled={isCapturing || isRaffleRigged}
						/>
					</div>
					{/* Main Raffle Buttons */}
					<div className="space-y-4">
						<div className="flex">
							<Button
								onClick={() => {
									if (isCapturing || isRaffleRigged) {
										handleRaffleAction(
											createRaffleUiAction.stopRaffle(),
										);
									} else {
										handleRaffleAction(
											createRaffleUiAction.startRaffle(),
										);
									}
								}}
								disabled={!canStartRaffleState}
								variant={primaryButtonVariantState}
								className={`grow-1 font-bold ${showDropdownMenuState && "rounded-r-none"}`}
							>
								{primaryButtonTextState}
							</Button>
							{/* Previously showDropdownMenuState was a derived state but since this same
							component is used in the mobile version, if the sheet menu unmounts (user closes
							the menu) and the state changes in a way that would affect the sheet UI
							(Participants change from 0 to 1+) this causes the derived state to lazily
							load until the user opens the menu, causing the change of the button happening
							at the same time the menu is being opened, making the changes in the UI visible.
							Now we use reactive calculated state.*/}
							{showDropdownMenuState && (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="default"
											size="icon"
											className="fade-in slide-in-from-left-2 w-8 animate-in rounded-l-none border-l duration-200 ease-out"
										>
											<CaretDownIcon className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onClick={() => {
												handleRaffleAction(
													createRaffleUiAction.clearParticipants(),
												);
											}}
										>
											<EraserIcon className="h-4 w-4" />{" "}
											¿Borrar participantes?
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							)}
						</div>
						<div>
							<Button
								onClick={() => {
									if (isRaffleRigged) {
										handleRaffleAction(
											createRaffleUiAction.executeRaffle(),
										);
									} else {
										handleRaffleAction(
											createRaffleUiAction.rigRaffle(),
										);
									}
								}}
								disabled={secondaryButtonDisabledState}
								variant="secondary"
								className="w-full font-bold"
							>
								{secondaryButtonTextState}
							</Button>
						</div>
					</div>
				</div>
			</section>
			{/* Overlay to disable advanced options */}
			<DisabledOverlay disabled={hideRaffleControlsState}>
				<section className="py-4">
					<div className="flex space-x-3">
						<Switch
							checked={raffleConfig.advanced}
							id={advancedId}
							onCheckedChange={(checked) =>
								handleRaffleAction(
									createRaffleUiAction.toggleAdvanced(
										checked,
									),
								)
							}
						/>
						<Label htmlFor={advancedId}>¿Opciones avanzadas?</Label>
					</div>
				</section>
				{/* Advanced Options */}
				{raffleConfig.advanced && (
					<section className="fade-in slide-in-from-top-2 animate-in space-y-4 duration-200 ease-out">
						<div className="space-y-4">
							<div>
								<TypographyMuted>
									Filtros de Mensajes
								</TypographyMuted>
							</div>
							<div className="space-y-4 [&>div]:flex [&>div]:space-x-4">
								<div>
									<Switch
										checked={raffleConfig.ignoreMods}
										id={ignoreModsId}
										onCheckedChange={(checked) =>
											handleRaffleAction(
												createRaffleUiAction.toggleIgnoreMods(
													checked,
												),
											)
										}
									/>
									<Label
										htmlFor={ignoreModsId}
										className="flex-shrink-0 text-sm"
									>
										¿Ignorar mods?
									</Label>
									<TooltipInfo
										icon="QuestionIcon"
										size={16}
										content="No participan los mods"
									/>
								</div>
								<div>
									<Switch
										checked={raffleConfig.ignoreSubs}
										id={ignoreSubsId}
										onCheckedChange={(checked) =>
											handleRaffleAction(
												createRaffleUiAction.toggleIgnoreSubs(
													checked,
												),
											)
										}
									/>
									<Label
										htmlFor={ignoreSubsId}
										className="flex-shrink-0 text-sm"
									>
										¿Ignorar suscriptores?
									</Label>
									<TooltipInfo
										icon="QuestionIcon"
										size={16}
										content="No participan los suscriptores"
									/>
								</div>
								<div>
									<Switch
										checked={raffleConfig.ignoreVips}
										id={ignoreVipsId}
										onCheckedChange={(checked) =>
											handleRaffleAction(
												createRaffleUiAction.toggleIgnoreVips(
													checked,
												),
											)
										}
									/>
									<Label
										htmlFor={ignoreVipsId}
										className="flex-shrink-0 text-sm"
									>
										¿Ignorar VIPs?
									</Label>
									<TooltipInfo
										icon="QuestionIcon"
										size={16}
										content="No participan los VIPs"
									/>
								</div>
								<div>
									<Switch
										checked={raffleConfig.caseSensitive}
										id={caseSensitiveId}
										onCheckedChange={(checked) =>
											handleRaffleAction(
												createRaffleUiAction.toggleCaseSensitive(
													checked,
												),
											)
										}
									/>
									<Label
										htmlFor={caseSensitiveId}
										className="flex-shrink-0 text-sm"
									>
										¿Respetar mayúsculas?
									</Label>
									<TooltipInfo
										icon="QuestionIcon"
										size={16}
										content="Si palabra es 'Hola' no captura 'hola'"
									/>
								</div>
							</div>
							<div>
								<TypographyMuted>
									Configuración de Sorteo
								</TypographyMuted>
							</div>
							<div className="space-y-4 [&>div]:flex [&>div]:space-x-4">
								<div>
									<Switch
										checked={raffleConfig.removeWinners}
										id={removeWinnersId}
										onCheckedChange={(checked) =>
											handleRaffleAction(
												createRaffleUiAction.toggleRemoveWinners(
													checked,
												),
											)
										}
									/>
									<Label
										htmlFor={removeWinnersId}
										className="flex-shrink-0 text-sm"
									>
										¿Quitar a los ganadores?
									</Label>
									<TooltipInfo
										icon="QuestionIcon"
										size={16}
										content="Los ganadores no vuelven a participar"
									/>
								</div>
								{!raffleConfig.ignoreSubs && (
									<>
										<div>
											<Switch
												checked={
													raffleConfig.subsExtraTickets
												}
												id={subsExtraTicketsId}
												onCheckedChange={(checked) =>
													handleRaffleAction(
														createRaffleUiAction.toggleSubsExtraTickets(
															checked,
														),
													)
												}
											/>
											<Label
												htmlFor={subsExtraTicketsId}
												className="flex-shrink-0 text-sm"
											>
												¿Subs con más boletos?
											</Label>
											<TooltipInfo
												icon="QuestionIcon"
												size={16}
												content="Subs reciben más participaciones"
											/>
										</div>

										{showSubsExtraTicketsState && (
											<div className="fade-in slide-in-from-top-2 animate-in flex-col duration-200 ease-out">
												<Label className="my-1 text-foreground text-sm">
													¿Cuántos boletos más por
													sub?
												</Label>
												<NumberInput
													key="subsExtraValue"
													className="py-0"
													minValue={1}
													value={
														raffleConfig.subsExtraValue
													}
													onClick={(_, counter) =>
														handleRaffleAction(
															createRaffleUiAction.updateSubsExtraValue(
																counter,
															),
														)
													}
												/>
											</div>
										)}
									</>
								)}
								{!raffleConfig.ignoreVips && (
									<>
										<div>
											<Switch
												checked={
													raffleConfig.vipsExtraTickets
												}
												id={vipsExtraTicketsId}
												onCheckedChange={(checked) =>
													handleRaffleAction(
														createRaffleUiAction.toggleVipsExtraTickets(
															checked,
														),
													)
												}
											/>
											<Label
												htmlFor={vipsExtraTicketsId}
												className="flex-shrink-0 text-sm"
											>
												¿VIPs con más boletos?
											</Label>
											<TooltipInfo
												icon="QuestionIcon"
												size={16}
												content="VIPs reciben más participaciones"
											/>
										</div>
										{showVipsExtraTicketsState && (
											<div className="fade-in slide-in-from-top-2 animate-in flex-col duration-200 ease-out">
												<Label className="my-1 text-foreground text-sm">
													¿Cuántos boletos más por
													VIP?
												</Label>
												<NumberInput
													key="vipsExtraValue"
													className="py-0"
													minValue={1}
													value={
														raffleConfig.vipsExtraValue
													}
													onClick={(_, counter) =>
														handleRaffleAction(
															createRaffleUiAction.updateVipsExtraValue(
																counter,
															),
														)
													}
												/>
											</div>
										)}
									</>
								)}
							</div>
						</div>
					</section>
				)}
			</DisabledOverlay>
		</>
	);
}
