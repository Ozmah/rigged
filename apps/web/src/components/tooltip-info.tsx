// import { BadgeInfo, Info, type LucideIcon } from "lucide-react";
import { type Icon, InfoIcon, QuestionIcon } from "@phosphor-icons/react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface TooltipInfoProps {
	icon: "InfoIcon" | "QuestionIcon";
	content: string;
	size?: number;
	className?: string;
}

const iconMap: Record<string, Icon> = {
	InfoIcon: InfoIcon,
	QuestionIcon: QuestionIcon,
};

export function TooltipInfo({ ...props }: TooltipInfoProps) {
	const SelectedIcon = iconMap[props.icon];

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<SelectedIcon size={props.size} className={props.className} />
			</TooltipTrigger>
			<TooltipContent>
				<p>{props.content}</p>
			</TooltipContent>
		</Tooltip>
	);
}
