"use client"

import { useEffect, useState } from "react"
import { Minus, Square, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { closeWindow, isTauri, minimizeWindow, toggleMaximizeWindow } from "@/lib/tauri-bridge"

export function TitleBar() {
  const [inTauri, setInTauri] = useState(false)

  useEffect(() => {
    setInTauri(isTauri())
  }, [])

  return (
    <div
      data-tauri-drag-region
      className="flex items-center justify-between select-none"
    >
      {/* Logo — sits inside drag region; not interactive so no conflict */}
      <div className="flex items-center gap-2 text-foreground/85 pointer-events-none">
        <img src="/icon.ico" className="size-5 rounded-[4px]" alt="" aria-hidden />
        <span className="text-[13px] font-medium tracking-tight">BloomBatch</span>
      </div>

      {/* Window controls — only rendered in Tauri; pointer-events restored so they're clickable */}
      {inTauri && (
        <div
          className="flex items-center gap-0.5"
          // Stop mousedown from bubbling to the drag region so clicks don't start a drag
          onMouseDown={(e) => e.stopPropagation()}
        >
          <WinBtn
            label="Minimize"
            onClick={minimizeWindow}
            className="hover:bg-foreground/[0.07] hover:text-foreground"
          >
            <Minus className="size-3" strokeWidth={1.75} />
          </WinBtn>

          <WinBtn
            label="Maximize"
            onClick={toggleMaximizeWindow}
            className="hover:bg-foreground/[0.07] hover:text-foreground"
          >
            <Square className="size-2.5" strokeWidth={1.75} />
          </WinBtn>

          <WinBtn
            label="Close"
            onClick={closeWindow}
            className="hover:bg-red-500/15 hover:text-red-500 dark:hover:bg-red-500/20 dark:hover:text-red-400"
          >
            <X className="size-3" strokeWidth={1.75} />
          </WinBtn>
        </div>
      )}
    </div>
  )
}

function WinBtn({
  label,
  onClick,
  className,
  children,
}: {
  label: string
  onClick: () => void
  className?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex size-7 items-center justify-center rounded-md text-foreground/45 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        className
      )}
    >
      {children}
    </button>
  )
}
