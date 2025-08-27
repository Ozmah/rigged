import { useState } from 'react';
import { TypographyH1, TypographyLarge } from "@/components/ui/typography";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";

export const Route = createFileRoute("/nope")({
	component: NopeComponent,
});

function NopeComponent() {
	const [imageLoaded, setImageLoaded] = useState(false);

	return (
		<div className="grid h-screen grid-cols-1 grid-rows-[64px_repeat(7,minmax(10px,1fr))]
gap-2 md:grid-cols-[repeat(10,minmax(10px,1fr))]">
			<motion.div
				initial={{ scale: 0 }}
				animate={{
					animationDelay: 900,
					scale: 1
				}}
				className="col-span-full row-start-4 row-span-auto md:col-start-4 md:col-span-4
md:row-span-3 md:row-start-3"
			>
				<TypographyH1 className="text-8xl mb-8">NOPE!</TypographyH1>

				<div className="relative w-full max-w-md mx-auto px-6">
					{!imageLoaded && (
						<div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
							<div className="animate-pulse w-full h-full bg-gray-300 rounded-lg"></div>
						</div>
					)}

					<TypographyLarge className='text-center py-3'>Todavía no está para celulares, voy tan rápido como puedo</TypographyLarge>

					<motion.img
						src="/images/nope.jpg"
						alt="Nope reaction"
						className="w-auto h-auto rounded-lg shadow-lg"
						onLoad={() => setImageLoaded(true)}
						loading="lazy"
						// 🎬 Animación cuando carga la imagen
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{
							opacity: imageLoaded ? 1 : 0,
							scale: imageLoaded ? 1 : 0.8
						}}
						transition={{
							duration: 0.5,
							ease: "backOut"
						}}
					/>
				</div>
			</motion.div>
		</div>
	);
}