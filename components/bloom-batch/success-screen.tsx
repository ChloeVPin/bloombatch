"use client"

import { Button } from "@/components/ui/button"
type Props = {
  count: number
  onAnother: () => void
  onReview: () => void
}

export function SuccessScreen({ count, onAnother, onReview }: Props) {
  const word = count === 1 ? "file" : "files"
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 text-center">
      <div className="relative flex size-20 items-center justify-center">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-foreground/[0.04]"
        />
        <span
          aria-hidden="true"
          className="absolute inset-2 rounded-full bg-foreground/[0.05]"
        />
        <img src="/icon.ico" className="relative size-9" alt="" aria-hidden />
      </div>

      <h2 className="mt-8 text-balance font-serif text-3xl tracking-tight text-foreground sm:text-[34px]">
        All set.
      </h2>
      <p className="mt-3 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
        {count} {word} renamed. Originals stay where you left them — only the
        names you saw in the preview were changed.
      </p>

      <div className="mt-9 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-center">
        <Button
          onClick={onAnother}
          className="h-10 rounded-full px-5 text-sm font-medium"
        >
          Rename another batch
        </Button>
        <Button
          onClick={onReview}
          variant="ghost"
          className="h-10 rounded-full px-5 text-sm font-medium text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
        >
          Review the list
        </Button>
      </div>
    </div>
  )
}
