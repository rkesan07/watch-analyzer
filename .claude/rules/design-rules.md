---
description: Design system rules for Watch Analyzer. Apply to ALL frontend components.
globs: ["src/**/*.tsx", "src/**/*.css"]
---

# Design Rules

## Identity
Luxury product for watch collectors. Every pixel intentional. Swiss watch ad meets Bloomberg terminal.

## Never
- Inter, Roboto, Arial, or system fonts
- Purple gradients or generic AI color schemes
- Default Tailwind component patterns
- Light backgrounds or white themes
- Heavy shadows
- Lorem ipsum placeholder text
- Spinners for loading states
- Generic card layouts

## Always
- Color palette from CLAUDE.md (near-black bg, gold accents)
- Cormorant Garamond for display text, JetBrains Mono for numbers, DM Sans for body
- Subtle noise texture on background
- Numbers animate counting up
- Gold (#c9a84c) used sparingly — expensive, not gaudy
- Sufficient contrast on dark backgrounds
- Data dense but elegant
- Subtle hover states on interactive elements
- Skeleton shimmer for loading

## Components
- Cards: bg-[#111114] border border-[#1e1e24] rounded-lg p-6
- Numbers: font-mono (JetBrains Mono), slightly larger
- Labels: text-[#6b6b76] uppercase tracking-wider text-xs
- Values: text-[#f0f0f2] font-medium
- Positive: text-[#10b981]
- Negative: text-[#ef4444]
- Gold accent: text-[#c9a84c] or border-[#c9a84c]
- Chart line: #c9a84c with subtle area fill rgba(201,168,76,0.08)
