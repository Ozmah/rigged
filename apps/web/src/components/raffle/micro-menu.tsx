import { GiftIcon, SlidersIcon, TestTubeIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface MicroMenuProps {
	className?: string;
}

export function MicroMenu({ className = "" }: MicroMenuProps) {
	return (
		<div className="flex h-full flex-col items-end justify-start gap-3">
			<div className="flex h-40 w-14 flex-wrap items-center justify-center gap-1 rounded-lg bg-card py-2 transition-colors">
				<Button variant="secondary" size="icon" className="size-10">
					<GiftIcon className="size-6" />
				</Button>
				<Button variant="secondary" size="icon" className="size-10">
					<SlidersIcon className="size-6" />
				</Button>
				<Button variant="secondary" size="icon" className="size-10">
					<TestTubeIcon className="size-6" />
				</Button>
			</div>
		</div>
	);
}
