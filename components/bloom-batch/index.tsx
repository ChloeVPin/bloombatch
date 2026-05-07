"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { isTauri, listenFileDrop, renameFiles } from "@/lib/tauri-bridge"
import { DropZone } from "./drop-zone"
import { PreviewList } from "./preview-list"
import { RuleControls } from "./rule-controls"
import { SuccessScreen } from "./success-screen"
import { TitleBar } from "./titlebar"
import {
  applyRules,
  defaultRules,
  type DroppedFile,
  type FileItem,
  type Rules,
} from "./rename"

type View = "compose" | "success"

let idSeed = 0
const nextId = () => `f_${Date.now().toString(36)}_${(idSeed++).toString(36)}`

/** Replace the filename component of a full path without touching the directory. */
function withNewName(oldPath: string, newName: string): string {
  const lastSlash = Math.max(oldPath.lastIndexOf("/"), oldPath.lastIndexOf("\\"))
  return lastSlash >= 0 ? oldPath.slice(0, lastSlash + 1) + newName : newName
}

export function BloomBatch() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [rules, setRules] = useState<Rules>(defaultRules)
  const [view, setView] = useState<View>("compose")
  const [lastRenamed, setLastRenamed] = useState(0)

  // ── Add files (deduped by path or name+size in browser mode) ─────────────

  const addFiles = useCallback((incoming: DroppedFile[]) => {
    setFiles((prev) => {
      const existing = new Set(
        prev.map((f) => f.path || `${f.originalName}__${f.size}`)
      )
      const additions: FileItem[] = []
      for (const file of incoming) {
        const key = file.path || `${file.name}__${file.size}`
        if (existing.has(key)) continue
        existing.add(key)
        additions.push({
          id: nextId(),
          originalName: file.name,
          path: file.path,
          size: file.size,
        })
      }
      return [...prev, ...additions]
    })
  }, [])

  // ── Tauri window-level drag-drop listener ─────────────────────────────────

  useEffect(() => {
    if (!isTauri()) return
    let unlisten: (() => void) | undefined
    let mounted = true

    listenFileDrop(addFiles).then((fn) => {
      if (mounted) {
        unlisten = fn
      } else {
        fn() // component already unmounted — clean up immediately
      }
    })

    return () => {
      mounted = false
      unlisten?.()
    }
  }, [addFiles])

  // ── File management ───────────────────────────────────────────────────────

  const removeFile = (id: string) =>
    setFiles((prev) => prev.filter((f) => f.id !== id))

  const clearAll = () => {
    setFiles([])
    setRules(defaultRules)
  }

  // ── Preview ───────────────────────────────────────────────────────────────

  const changedCount = useMemo(() => {
    let n = 0
    for (let i = 0; i < files.length; i++) {
      if (applyRules(files[i].originalName, rules, i) !== files[i].originalName) n++
    }
    return n
  }, [files, rules])

  // ── Apply renames ─────────────────────────────────────────────────────────

  const apply = async () => {
    if (files.length === 0 || changedCount === 0) return

    // Build the list of ops that have a real path (Tauri mode).
    const ops = files
      .map((f, i) => ({ f, i, newName: applyRules(f.originalName, rules, i) }))
      .filter(({ f, newName }) => f.path && newName !== f.originalName)
      .map(({ f, newName }) => ({ from: f.path, new_name: newName }))

    if (ops.length > 0) {
      try {
        await renameFiles(ops)
      } catch (err) {
        console.error("[BloomBatch] rename_files failed:", err)
        return
      }
    }

    // Update UI state to reflect the new names and paths.
    setFiles((prev) =>
      prev.map((f, i) => {
        const newName = applyRules(f.originalName, rules, i)
        return {
          ...f,
          originalName: newName,
          path: f.path ? withNewName(f.path, newName) : f.path,
        }
      })
    )

    setRules(defaultRules)
    setLastRenamed(changedCount)
    setView("success")
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  const startAnother = () => {
    clearAll()
    setView("compose")
  }

  const reviewFiles = () => setView("compose")

  const hasFiles = files.length > 0

  // ── Render ────────────────────────────────────────────────────────────────

  if (view === "success") {
    return (
      <Shell>
        <SuccessScreen count={lastRenamed} onAnother={startAnother} onReview={reviewFiles} />
      </Shell>
    )
  }

  return (
    <Shell>
      {!hasFiles ? <EmptyState onFiles={addFiles} /> : null}

      {hasFiles ? (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <FileSummary count={files.length} onClear={clearAll} />

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-x-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <section aria-label="Rename rules" className="min-h-0 overflow-y-auto overflow-x-hidden px-1">
              <RuleControls rules={rules} onChange={setRules} />
            </section>

            <section aria-label="Preview" className="flex min-h-0 flex-col gap-3">
              <PreviewList files={files} rules={rules} onRemove={removeFile} />
              <DropZone onFiles={addFiles} compact />
            </section>
          </div>

          <ActionBar changed={changedCount} total={files.length} onApply={apply} />
        </div>
      ) : null}
    </Shell>
  )
}

// ── Layout primitives ─────────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex h-screen w-full max-w-5xl flex-col overflow-hidden px-5 py-6">
      <TitleBar />
      <div className="mt-6 flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}

function EmptyState({ onFiles }: { onFiles: (files: DroppedFile[]) => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center gap-8">
      <div className="max-w-2xl space-y-4">
        <h1 className="text-balance font-serif text-[42px] font-normal leading-[1.05] tracking-tight text-foreground sm:text-[52px]">
          Rename many files,
          <span className="text-muted-foreground"> beautifully.</span>
        </h1>
        <p className="max-w-md text-pretty text-[15px] leading-relaxed text-muted-foreground">
          Drop in a batch, set a rule, preview every change. Quiet, focused,
          and entirely on your device.
        </p>
      </div>

      <DropZone onFiles={onFiles} />
    </div>
  )
}

function FileSummary({ count, onClear }: { count: number; onClear: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm tracking-tight text-foreground">
        <span className="font-medium">{count}</span>{" "}
        <span className="text-muted-foreground">
          {count === 1 ? "file ready" : "files ready"}
        </span>
      </p>
      <button
        type="button"
        onClick={onClear}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs text-muted-foreground transition-colors",
          "hover:bg-foreground/[0.04] hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        )}
      >
        Clear
      </button>
    </div>
  )
}

function ActionBar({
  changed,
  total,
  onApply,
}: {
  changed: number
  total: number
  onApply: () => void
}) {
  const disabled = changed === 0
  return (
    <div className="flex flex-col-reverse items-stretch gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        {disabled
          ? "Adjust a rule to preview changes."
          : `${changed} of ${total} ${total === 1 ? "file" : "files"} will change. Originals stay untouched until you apply.`}
      </p>
      <Button
        onClick={onApply}
        disabled={disabled}
        className="h-10 rounded-full px-5 text-sm font-medium sm:min-w-[10rem]"
      >
        {disabled
          ? "Apply rename"
          : `Apply to ${changed} ${changed === 1 ? "file" : "files"}`}
      </Button>
    </div>
  )
}
