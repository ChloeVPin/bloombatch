"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { applyRules, type FileItem, type Rules } from "./rename"

type Props = {
  files: FileItem[]
  rules: Rules
  onRemove: (id: string) => void
}

export function PreviewList({ files, rules, onRemove }: Props) {
  const previews = files.map((f, i) => ({
    item: f,
    next: applyRules(f.originalName, rules, i),
  }))

  // Detect collisions in the new names so we can warn quietly.
  const counts = new Map<string, number>()
  for (const p of previews) counts.set(p.next, (counts.get(p.next) ?? 0) + 1)

  return (
    <ScrollArea className="flex-1 min-h-0 rounded-2xl border bg-card">
      <ul className="divide-y divide-border/60">
        {previews.map(({ item, next }) => {
          const changed = next !== item.originalName
          const duplicated = (counts.get(next) ?? 0) > 1
          return (
            <li
              key={item.id}
              className="group relative grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-4 px-4 py-3"
            >
              <p
                className="truncate font-mono text-[12.5px] text-muted-foreground"
                title={item.originalName}
              >
                {item.originalName}
              </p>

              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={cn(
                    "size-1 shrink-0 rounded-full transition-colors",
                    duplicated
                      ? "bg-destructive"
                      : changed
                      ? "bg-foreground/70"
                      : "bg-transparent",
                  )}
                  aria-hidden="true"
                />
                <p
                  className={cn(
                    "truncate font-mono text-[12.5px]",
                    duplicated
                      ? "text-destructive"
                      : changed
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                  title={duplicated ? `Duplicate name: ${next}` : next}
                >
                  {next}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${item.originalName}`}
                onClick={() => onRemove(item.id)}
                className="absolute right-3 top-1/2 size-7 -translate-y-1/2 rounded-full bg-card/85 text-muted-foreground opacity-0 backdrop-blur transition-opacity hover:bg-foreground/[0.06] hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100"
              >
                <X className="size-3" aria-hidden="true" />
              </Button>
            </li>
          )
        })}
      </ul>
    </ScrollArea>
  )
}
