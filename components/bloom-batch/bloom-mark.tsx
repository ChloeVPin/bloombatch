import { cn } from "@/lib/utils"

type Props = {
  className?: string
  strokeWidth?: number
  "aria-hidden"?: boolean
}

/**
 * BloomMark — a quiet four-petal rosette used as the BloomBatch brand
 * glyph. Two concentric, slightly rotated petal sets create a soft,
 * deliberate bloom without resembling a generic flower icon.
 */
export function BloomMark({
  className,
  strokeWidth = 1.25,
  "aria-hidden": ariaHidden = true,
}: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      className={cn("size-4", className)}
    >
      <circle cx="12" cy="7.25" r="3.25" />
      <circle cx="16.75" cy="12" r="3.25" />
      <circle cx="12" cy="16.75" r="3.25" />
      <circle cx="7.25" cy="12" r="3.25" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}
