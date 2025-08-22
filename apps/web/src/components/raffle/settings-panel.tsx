import { useStore } from "@tanstack/react-store";
import { toast } from "sonner";
import { NumberInput } from "@/components/number-input";
import { TooltipInfo } from "@/components/tooltip-info";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TypographyH4 } from "@/components/ui/typography";
import {
	chatStore,
	executeRaffle,
	startRaffleCapture,
	startTestMessageGeneration,
	stopRaffleCapture,
	stopTestMessageGeneration,
	updateRaffleConfig,
} from "@/stores/chat";

interface SettingsPanelProps {
	className?: string;
}

export function SettingsPanel({ className = "" }: SettingsPanelProps) {
	const participants = useStore(chatStore, (state) => state.participants);
	const isCapturing = useStore(chatStore, (state) => state.isCapturing);
	const isConnected = useStore(
		chatStore,
		(state) => state.connectionStatus === "connected",
	);
	const raffleConfig = useStore(chatStore, (state) => state.raffleConfig);

	// All these handles need to go to a single hook
	// Need implementation for a debug mode
	// const debugMode = useStore(authStore, (state) => state.debugMode);
	// if (debugMode)
	const handleAddTestMessages = () => {
		startTestMessageGeneration();
		toast.success("🎲 Generando Mensajes", {
			description: "Creando mensajes para simular rifas",
			duration: 3000,
		});
	};

	const handleStopTestMessages = () => {
		stopTestMessageGeneration();
		toast.success("🎲 Mensajes detenidos", {
			duration: 3000,
		});
	};

	const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleStartCapture();
		}
	};

	const handleCounter = (counterId: string, counter: number) => {
		updateRaffleConfig({ [counterId]: counter });
	};

	const handleToggle = (switchId: string, checked: boolean) => {
		updateRaffleConfig({ [switchId]: checked });
	};

	const handleStartCapture = () => {
		startRaffleCapture();
		toast.success("🎲 Captura iniciada", {
			description: `Capturando participantes con la palabra "${raffleConfig.keyword}"`,
			duration: 3000,
		});
	};

	const handleStopCapture = () => {
		stopRaffleCapture();
		toast.info("⏹️ Captura detenida", {
			description: `Se capturaron ${participants.length} participantes únicos.`,
			duration: 3000,
		});
	};

	const handleExecuteRaffle = () => {
		const winners = executeRaffle();
		console.log("Raffle winners:", winners);

		if (winners.length > 0) {
			const winnerNames = winners.map((w) => w.displayName).join(", ");
			toast.success("🎉 ¡Sorteo completado!", {
				description: `Ganador${winners.length > 1 ? "es" : ""}: ${winnerNames}`,
				duration: 8000,
			});
		} else {
			toast.error("❌ No hay participantes", {
				description:
					"No se puede realizar el sorteo sin participantes.",
				duration: 4000,
			});
		}
	};

	const handleKeywordChange = (keyword: string) => {
		updateRaffleConfig({ keyword });
	};

	// Debug
	const isGeneratingMessages = useStore(
		chatStore,
		(state) => state.debug.isChatGenerating,
	);

	return (
		<div className="@container flex flex-col justify-center space-y-4 rounded-lg border bg-card px-4 py-4">
			{/* Main Controls */}
			<section className="space-y-4">
				<div className="space-y-4">
					<div className="">
						<TypographyH4>Ajustes de Rifa</TypographyH4>
					</div>
					<div className="">
						<FloatingInput
							id="keyword"
							label="Palabra clave"
							value={raffleConfig.keyword}
							onKeyUp={handleKeyUp}
							onChange={handleKeywordChange}
							placeholder="Ej: !sorteo"
						/>
					</div>
					<div className="space-y-4">
						<div>
							<Button
								onClick={
									isCapturing
										? handleStopCapture
										: handleStartCapture
								}
								disabled={!isConnected}
								variant={isCapturing ? "secondary" : "default"}
								className="w-full font-bold"
							>
								{isCapturing
									? "Detener Captura"
									: "Iniciar Captura"}
							</Button>
						</div>
						<div>
							<Button
								onClick={handleExecuteRaffle}
								disabled={
									!isCapturing || participants.length === 0
								}
								variant="outline"
								className="w-full font-bold"
							>
								Participantes ({participants.length})
							</Button>
						</div>
					</div>
				</div>
				<div className="inline-flex space-x-3">
					<Switch
						checked={raffleConfig.advanced}
						id="advanced"
						onCheckedChange={(checked) =>
							handleToggle("advanced", checked)
						}
					/>
					<Label htmlFor="advanced">¿Opciones avanzadas?</Label>
				</div>
			</section>
			{/* Advanced Options */}
			{raffleConfig.advanced && (
				<section className="fade-in slide-in-from-top-2 .46, .45, .94)] animate-in space-y-4 duration-150 ease-[cubic-bezier(.25,">
					<div className="space-y-4">
						<div>
							<TypographyH4>Configuración de Sorteo</TypographyH4>
						</div>
						<div className="space-y-4">
							<div className="inline-flex space-x-3">
								<Switch
									checked={raffleConfig.removeWinners}
									id="removeWinners"
									onCheckedChange={(checked) =>
										handleToggle("removeWinners", checked)
									}
								/>
								<Label
									htmlFor="removeWinners"
									className="flex-shrink-0 text-sm"
								>
									¿Quitar a los ganadores?
								</Label>
								<TooltipInfo
									icon="QuestionIcon"
									// Change hardcoded value
									size={16}
									content="Los ganadores salen de la lista de participantes"
								/>
							</div>
							<div className="inline-flex space-x-3">
								<Switch
									checked={raffleConfig.followersOnly}
									id="followersOnly"
									onCheckedChange={(checked) =>
										handleToggle("followersOnly", checked)
									}
								/>
								<Label
									htmlFor="followersOnly"
									className="flex-shrink-0 text-sm"
								>
									¿Sólo seguidores?
								</Label>
								<TooltipInfo
									icon="QuestionIcon"
									// Change hardcoded value
									size={16}
									content="Si no son seguidores, no participan"
								/>
							</div>
							<div className="inline-flex space-x-3">
								<Switch
									checked={raffleConfig.subsExtraTickets}
									id="subsExtraTickets"
									onCheckedChange={(checked) =>
										handleToggle(
											"subsExtraTickets",
											checked,
										)
									}
								/>
								<Label
									htmlFor="subsExtraTickets"
									className="flex-shrink-0 text-sm"
								>
									¿Subs con más boletos?
								</Label>
								<TooltipInfo
									icon="QuestionIcon"
									// Change hardcoded value
									size={16}
									content="Subs reciben más participaciones"
								/>
							</div>
							{raffleConfig.subsExtraTickets && (
								<div className="fade-in slide-in-from-top-2 .46, .45, .94)] animate-in duration-200 ease-[cubic-bezier(.25,">
									<Label className="my-1 text-foreground text-sm">
										¿Cuántos boletos más por sub?
									</Label>
									<NumberInput
										key="subsExtraValue"
										className="py-0"
										value={raffleConfig.subsExtraValue}
										onClick={(_e, counter) =>
											handleCounter(
												"subsExtraValue",
												counter,
											)
										}
									/>
								</div>
							)}
							<div className="inline-flex space-x-3">
								<Switch
									checked={raffleConfig.vipsExtraTickets}
									id="vipsExtraTickets"
									onCheckedChange={(checked) =>
										handleToggle(
											"vipsExtraTickets",
											checked,
										)
									}
								/>
								<Label
									htmlFor="vipsExtraTickets"
									className="flex-shrink-0 text-sm"
								>
									¿VIPs con más boletos?
								</Label>
								<TooltipInfo
									icon="QuestionIcon"
									// Change hardcoded value
									size={16}
									content="VIPs reciben más participaciones"
								/>
							</div>
							{raffleConfig.vipsExtraTickets && (
								<div className="fade-in slide-in-from-top-2 .46, .45, .94)] animate-in duration-200 ease-[cubic-bezier(.25,">
									<Label className="my-1 text-foreground text-sm">
										¿Cuántos boletos más por VIP?
									</Label>
									<NumberInput
										key="vipsExtraValue"
										className="py-0"
										value={raffleConfig.vipsExtraValue}
										onClick={(_e, counter) =>
											handleCounter(
												"vipsExtraValue",
												counter,
											)
										}
									/>
								</div>
							)}
							<div>
								<Label className="my-1 text-foreground text-sm">
									¿Cuántos ganadores?
								</Label>
								<NumberInput
									key="maxWinners"
									className="py-0"
									value={raffleConfig.maxWinners}
									onClick={(_e, counter) =>
										handleCounter("maxWinners", counter)
									}
								/>
							</div>
						</div>
						<div>
							<TypographyH4>Filtros de Mensajes</TypographyH4>
						</div>
						<div className="space-y-4">
							<div className="inline-flex space-x-3">
								<Switch
									checked={raffleConfig.ignoreMods}
									id="ignoreMods"
									onCheckedChange={(checked) =>
										handleToggle("ignoreMods", checked)
									}
								/>
								<Label
									htmlFor="ignoreMods"
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
							<div className="inline-flex space-x-3">
								<Switch
									checked={raffleConfig.caseSensitive}
									id="caseSensitive"
									onCheckedChange={(checked) =>
										handleToggle("caseSensitive", checked)
									}
								/>
								<Label
									htmlFor="caseSensitive"
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
					</div>
				</section>
			)}
			{/* Debug Tooling */}
			<section className="my-5 rounded-lg border bg-card">
				<Button
					onClick={
						isGeneratingMessages
							? handleStopTestMessages
							: handleAddTestMessages
					}
					variant={isGeneratingMessages ? "secondary" : "default"}
					className="w-full font-bold"
				>
					{isGeneratingMessages ? "Detener" : "Generar Mensajes"}
				</Button>
			</section>
		</div>
	);
}
