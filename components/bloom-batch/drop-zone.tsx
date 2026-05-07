"use client"

import { useCallback, useRef, useState } from "react"
import { UploadCloud } from "lucide-react"
import { cn } from "@/lib/utils"
import { isTauri, openFilesDialog } from "@/lib/tauri-bridge"
import type { DroppedFile } from "./rename"

type Props = {
  onFiles: (files: DroppedFile[]) => void
  compact?: boolean
}

export function DropZone({ onFiles, compact = false }: Props) {
  const [isOver, setIsOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Browser-mode: convert native File objects to DroppedFile (no real path).
  const handleBrowserDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsOver(false)
      if (isTauri()) return // Tauri drop is handled by the parent via onDragDropEvent
      const files: DroppedFile[] = Array.from(e.dataTransfer.files ?? []).map(
        (f) => ({ name: f.name, path: "", size: f.size })
      )
      if (files.length > 0) onFiles(files)
    },
    [onFiles]
  )

  // Browser-mode: convert input files to DroppedFile.
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files: DroppedFile[] = Array.from(e.target.files ?? []).map((f) => ({
        name: f.name,
        path: "",
        size: f.size,
      }))
      if (files.length > 0) onFiles(files)
      e.target.value = ""
    },
    [onFiles]
  )

  // Click handler: use Tauri's native dialog when available, fall back to <input>.
  const handleClick = useCallback(async () => {
    if (isTauri()) {
      const files = await openFilesDialog()
      if (files.length > 0) onFiles(files)
    } else {
      inputRef.current?.click()
    }
  }, [onFiles])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        handleClick()
      }
    },
    [handleClick]
  )

  const sharedDragProps = {
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsOver(true)
    },
    onDragLeave: () => setIsOver(false),
    onDrop: handleBrowserDrop,
  }

  if (compact) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...sharedDragProps}
        className={cn(
          "group flex w-full cursor-pointer items-center justify-center rounded-lg border border-dashed px-4 py-3 text-xs transition-colors",
          "text-muted-foreground hover:border-foreground/25 hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isOver ? "border-foreground/35 text-foreground" : "border-border/70"
        )}
        aria-label="Add more files"
      >
        <HiddenInput ref={inputRef} onChange={handleInputChange} />
        <span className="tracking-tight">Drop or click to add more</span>
      </div>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...sharedDragProps}
      className={cn(
        "group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed px-8 py-24 text-center transition-all sm:py-32",
        "hover:border-foreground/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
        isOver ? "border-foreground/45 bg-card" : "border-border/85 bg-transparent"
      )}
      aria-label="Drop files or click to browse"
    >
      <HiddenInput ref={inputRef} onChange={handleInputChange} />
      <UploadCloud
        className={cn(
          "mb-5 size-10 transition-colors",
          isOver ? "text-foreground/60" : "text-muted-foreground/60"
        )}
        strokeWidth={1.25}
      />
      <p className="font-serif text-lg tracking-tight text-foreground/90">
        Drop files here
      </p>
      <p className="mt-2 text-xs text-muted-foreground">or click anywhere to browse</p>
    </div>
  )
}

// Shared hidden file input — only used in browser mode (Tauri uses the dialog instead).
function HiddenInput({
  ref,
  onChange,
}: {
  ref: React.RefObject<HTMLInputElement | null>
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <input
      ref={ref}
      type="file"
      multiple
      className="sr-only"
      onChange={onChange}
      tabIndex={-1}
      aria-hidden="true"
    />
  )
}
