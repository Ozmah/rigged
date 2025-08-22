import type * as React from "react";

interface TypographyProps {
	children: React.ReactNode;
	className?: string;
}

export function TypographyH1({ children, className = "" }: TypographyProps) {
	return (
		<h1
			className={`scroll-m-20 text-balance text-center font-['Cabinet_Grotesk'] font-extrabold text-4xl tracking-tight ${className}`}
		>
			{children}
		</h1>
	);
}

export function TypographyH2({ children, className = "" }: TypographyProps) {
	return (
		<h2
			className={`scroll-m-20 border-b pb-2 font-['Cabinet_Grotesk'] font-semibold text-3xl tracking-tight first:mt-0 ${className}`}
		>
			{children}
		</h2>
	);
}

export function TypographyH3({ children, className = "" }: TypographyProps) {
	return (
		<h3
			className={`scroll-m-20 font-['Cabinet_Grotesk'] font-semibold text-2xl tracking-tight ${className}`}
		>
			{children}
		</h3>
	);
}

export function TypographyH4({ children, className = "" }: TypographyProps) {
	return (
		<h4
			className={`scroll-m-20 font-['Cabinet_Grotesk'] font-semibold text-xl tracking-tight ${className}`}
		>
			{children}
		</h4>
	);
}

export function TypographyH5({ children, className = "" }: TypographyProps) {
	return (
		<h5
			className={`scroll-m-20 font-['Cabinet_Grotesk'] font-semibold text-lg tracking-tight ${className}`}
		>
			{children}
		</h5>
	);
}

export function TypographyH6({ children, className = "" }: TypographyProps) {
	return (
		<h6
			className={`scroll-m-20 font-['Cabinet_Grotesk'] font-semibold text-base tracking-tight ${className}`}
		>
			{children}
		</h6>
	);
}

export function TypographyP({ children, className = "" }: TypographyProps) {
	return (
		<p className={`leading-7 [&:not(:first-child)]:mt-6 ${className}`}>
			{children}
		</p>
	);
}

export function TypographyBlockquote({
	children,
	className = "",
}: TypographyProps) {
	return (
		<blockquote className={`mt-6 border-l-2 pl-6 italic ${className}`}>
			{children}
		</blockquote>
	);
}

export function TypographyList({ children, className = "" }: TypographyProps) {
	return (
		<ul className={`my-6 ml-6 list-disc [&>li]:mt-2 ${className}`}>
			{children}
		</ul>
	);
}

export function TypographyInlineCode({
	children,
	className = "",
}: TypographyProps) {
	return (
		<code
			className={`relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold text-sm ${className}`}
		>
			{children}
		</code>
	);
}

export function TypographyLead({ children, className = "" }: TypographyProps) {
	return (
		<p className={`text-muted-foreground text-xl ${className}`}>
			{children}
		</p>
	);
}

export function TypographyLarge({ children, className = "" }: TypographyProps) {
	return (
		<div className={`font-semibold text-lg ${className}`}>{children}</div>
	);
}

export function TypographySmall({ children, className = "" }: TypographyProps) {
	return (
		<small className={`font-medium text-sm leading-none ${className}`}>
			{children}
		</small>
	);
}

export function TypographyMuted({ children, className = "" }: TypographyProps) {
	return (
		<p className={`text-muted-foreground text-sm ${className}`}>
			{children}
		</p>
	);
}
