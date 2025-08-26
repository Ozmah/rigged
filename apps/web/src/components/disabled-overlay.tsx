import { cn } from "@/lib/utils";
import { PacmanLoader } from "react-spinners";

interface DisabledOverlayProps {
    disabled: boolean;
    children: React.ReactNode;
    reason?: string;
    className?: string;
}

export function DisabledOverlay({
    disabled,
    children,
    reason = "Rifa en progreso",
    className
}: DisabledOverlayProps) {
    return (
        <div className={cn("relative", className)}>
            {/* Contenido original */}
            {children}

            {/* Overlay condicional */}
            {disabled && (
                <div className="absolute inset-0 bg-background/95 z-10 flex items-center justify-center rounded-md">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        {reason} <PacmanLoader color="#B4B8C7" size={12} />
                    </div>
                </div>
            )}
        </div>
    );
}
