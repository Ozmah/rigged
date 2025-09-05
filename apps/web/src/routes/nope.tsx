import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { TypographyH1, TypographyLarge } from "@/components/ui/typography";

export const Route = createFileRoute("/nope")({
	component: NopeComponent,
});

function NopeComponent() {
	const [imageLoaded, setImageLoaded] = useState(false);

	return (
		<div className="grid h-screen grid-cols-1 grid-rows-[64px_repeat(7,minmax(10px,1fr))] gap-2 md:grid-cols-[repeat(10,minmax(10px,1fr))]">
			<motion.div
				initial={{ scale: 0 }}
				animate={{
					animationDelay: 900,
					scale: 1,
				}}
				className="col-span-full row-span-auto row-start-3 md:col-span-4 md:col-start-4 md:row-span-3 md:row-start-3"
			>
				<TypographyH1 className="mb-8 text-8xl">NOPE!</TypographyH1>

				<div className="relative mx-auto w-full max-w-md px-6">
					{!imageLoaded && (
						<div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
							<div className="h-full w-full animate-pulse rounded-lg bg-gray-300" />
						</div>
					)}

					<TypographyLarge className="py-3 text-center">
						Todavía no está para celulares, voy tan rápido como
						puedo
					</TypographyLarge>

					<motion.img
						src="/images/nope.jpg"
						alt="Nope reaction"
						className="h-auto w-auto rounded-lg shadow-lg"
						onLoad={() => setImageLoaded(true)}
						loading="lazy"
						// 🎬 Animación cuando carga la imagen
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{
							opacity: imageLoaded ? 1 : 0,
							scale: imageLoaded ? 1 : 0.8,
						}}
						transition={{
							duration: 0.5,
							ease: "backOut",
						}}
					/>
				</div>
			</motion.div>
		</div>
	);
}
