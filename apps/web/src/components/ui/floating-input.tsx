import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

interface FloatingInputProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	id?: string;
}

export function FloatingInput({
	label,
	value,
	onChange,
	placeholder,
	className,
	id,
}: FloatingInputProps) {
	const [isFocused, setIsFocused] = useState(false);
	const hasContent = value.length > 0;
	const isFloating = isFocused || hasContent;

	return (
		<div className={cn("relative", className)}>
			<label
				htmlFor={id}
				className={cn("floating-label", isFloating && "floating-label-active")}
			>
				{label}
			</label>
			<Input
				id={id}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
				placeholder={isFloating ? placeholder : ""}
				className="floating-input"
			/>
		</div>
	);
}
