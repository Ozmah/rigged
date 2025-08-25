import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NumberInputProps {
	value?: number;
	size?: number;
	minValue?: number;
	className?: string;
	variant?: "default" | "round";
	onClick?: (
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
		counter: number,
	) => void;
}

export function NumberInput({ minValue = 0, ...props }: NumberInputProps) {
	const [counter, setCounter] = useState(props.value ?? 0);

	const variantClassNameButton = (): string => {
		return props.variant == "round" ? "rounded-full" : "";
	};

	// Still thinking about whether to use this
	// const variantClassNameInput = (): string => {
	// };

	const buttonHandler = (
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
	) => {
		const newCounterValue = Math.max(
			minValue,
			e.currentTarget.dataset.action == "increment"
				? counter + 1
				: counter - 1,
		);
		setCounter(newCounterValue);
		props.onClick?.(e, newCounterValue);
	};

	return (
		<div className={`flex w-35 items-center rounded-md ${props.className}`}>
			<Button
				variant="ghost"
				className={`${variantClassNameButton()}`}
				onClick={buttonHandler}
				data-action="decrement"
			>
				<CaretDownIcon size={props.size} weight="bold" />
			</Button>
			<Input
				// Need to replace Satoshi or use a fallback since it's an added font
				className="mx-0.5 justify-items-center border-0 font-['Satoshi'] font-bold dark:bg-transparent"
				key="numberInput"
				readOnly
				value={counter}
			/>
			<Button
				variant="ghost"
				className={`${variantClassNameButton()}`}
				onClick={buttonHandler}
				data-action="increment"
			>
				<CaretUpIcon size={props.size} weight="bold" />
			</Button>
		</div>
	);
}
