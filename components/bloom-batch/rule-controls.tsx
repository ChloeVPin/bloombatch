"use client"

import { useMemo, useState } from "react"
import { ChevronRight } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import {
  defaultRules,
  type CaseTransform,
  type NumberPosition,
  type Rules,
} from "./rename"

type Props = {
  rules: Rules
  onChange: (next: Rules) => void
}

export function RuleControls({ rules, onChange }: Props) {
  const set = <K extends keyof Rules>(key: K, value: Rules[K]) =>
    onChange({ ...rules, [key]: value })

  const setNumbering = <K extends keyof Rules["numbering"]>(
    key: K,
    value: Rules["numbering"][K],
  ) => onChange({ ...rules, numbering: { ...rules.numbering, [key]: value } })

  // Reveal sections by default only if they already have a value, so the
  // surface stays quiet for fresh batches but never hides active rules.
  const initialOpen = useMemo(
    () => ({
      affix:
        rules.prefix !== defaultRules.prefix ||
        rules.suffix !== defaultRules.suffix,
      sequence: rules.numbering.enabled,
      casing: rules.caseTransform !== defaultRules.caseTransform,
    }),
    // We only want this evaluated on mount, the user controls openness afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const [open, setOpen] = useState(initialOpen)

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Label
          htmlFor="find"
          className="text-[11px] font-normal uppercase tracking-[0.14em] text-muted-foreground"
        >
          Find &amp; replace
        </Label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            id="find"
            value={rules.find}
            onChange={(e) => set("find", e.target.value)}
            placeholder="Find"
            autoComplete="off"
            spellCheck={false}
            className="h-10 rounded-lg"
          />
          <Input
            id="replace"
            value={rules.replace}
            onChange={(e) => set("replace", e.target.value)}
            placeholder="Replace with"
            autoComplete="off"
            spellCheck={false}
            className="h-10 rounded-lg"
          />
        </div>
      </div>

      <div className="space-y-1">
        <DisclosureSection
          label="Prefix &amp; suffix"
          summary={summarizeAffix(rules)}
          open={open.affix}
          onOpenChange={(v) => setOpen((o) => ({ ...o, affix: v }))}
        >
          <div className="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-2">
            <Input
              value={rules.prefix}
              onChange={(e) => set("prefix", e.target.value)}
              placeholder="Prefix"
              autoComplete="off"
              spellCheck={false}
              className="h-10 rounded-lg"
            />
            <Input
              value={rules.suffix}
              onChange={(e) => set("suffix", e.target.value)}
              placeholder="Suffix"
              autoComplete="off"
              spellCheck={false}
              className="h-10 rounded-lg"
            />
          </div>
        </DisclosureSection>

        <DisclosureSection
          label="Sequence"
          summary={summarizeSequence(rules)}
          open={open.sequence}
          onOpenChange={(v) => setOpen((o) => ({ ...o, sequence: v }))}
          trailing={
            <Switch
              aria-label="Enable sequence numbering"
              checked={rules.numbering.enabled}
              onCheckedChange={(v) => {
                setNumbering("enabled", v)
                if (v) setOpen((o) => ({ ...o, sequence: true }))
              }}
              onClick={(e) => e.stopPropagation()}
            />
          }
        >
          <div
            aria-disabled={!rules.numbering.enabled}
            className={cn(
              "grid grid-cols-2 gap-3 pt-3 sm:grid-cols-4",
              !rules.numbering.enabled && "pointer-events-none opacity-50",
            )}
          >
            <SmallField label="Start at">
              <Input
                type="number"
                min={0}
                value={rules.numbering.start}
                onChange={(e) =>
                  setNumbering("start", Number(e.target.value) || 0)
                }
                className="h-9 rounded-lg"
              />
            </SmallField>
            <SmallField label="Digits">
              <Input
                type="number"
                min={1}
                max={6}
                value={rules.numbering.padding}
                onChange={(e) =>
                  setNumbering(
                    "padding",
                    Math.max(1, Number(e.target.value) || 1),
                  )
                }
                className="h-9 rounded-lg"
              />
            </SmallField>
            <SmallField label="Separator">
              <Input
                value={rules.numbering.separator}
                onChange={(e) => setNumbering("separator", e.target.value)}
                maxLength={3}
                placeholder="_"
                className="h-9 rounded-lg"
              />
            </SmallField>
            <SmallField label="Position">
              <Select
                value={rules.numbering.position}
                onValueChange={(v) =>
                  setNumbering("position", v as NumberPosition)
                }
              >
                <SelectTrigger className="h-9 w-full rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prefix">Before name</SelectItem>
                  <SelectItem value="suffix">After name</SelectItem>
                </SelectContent>
              </Select>
            </SmallField>
          </div>
        </DisclosureSection>

        <DisclosureSection
          label="Case"
          summary={summarizeCase(rules.caseTransform)}
          open={open.casing}
          onOpenChange={(v) => setOpen((o) => ({ ...o, casing: v }))}
        >
          <div className="pt-3">
            <Select
              value={rules.caseTransform}
              onValueChange={(v) => set("caseTransform", v as CaseTransform)}
            >
              <SelectTrigger className="h-10 w-full rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No change</SelectItem>
                <SelectItem value="lower">lowercase</SelectItem>
                <SelectItem value="upper">UPPERCASE</SelectItem>
                <SelectItem value="title">Title Case</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DisclosureSection>
      </div>
    </div>
  )
}

function DisclosureSection({
  label,
  summary,
  open,
  onOpenChange,
  trailing,
  children,
}: {
  label: string
  summary: string
  open: boolean
  onOpenChange: (v: boolean) => void
  trailing?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <div className="flex items-center gap-3 border-t border-border/60 first:border-t-0">
        <CollapsibleTrigger
          className={cn(
            "group flex flex-1 items-center justify-between gap-3 rounded-md py-3 text-left",
            "transition-colors hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          <span className="text-sm tracking-tight text-foreground">
            {label}
          </span>
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline">{summary}</span>
            <ChevronRight
              className={cn(
                "size-3.5 text-muted-foreground/70 transition-transform duration-200",
                open && "rotate-90",
              )}
              aria-hidden="true"
            />
          </span>
        </CollapsibleTrigger>
        {trailing && <div className="shrink-0">{trailing}</div>}
      </div>
      <CollapsibleContent className="data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0">
        <div className="pb-5">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function SmallField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

function summarizeAffix(rules: Rules): string {
  if (rules.prefix && rules.suffix) return "Wrapped"
  if (rules.prefix) return "Prefix"
  if (rules.suffix) return "Suffix"
  return "Off"
}

function summarizeSequence(rules: Rules): string {
  if (!rules.numbering.enabled) return "Off"
  const sample = String(rules.numbering.start).padStart(
    Math.max(1, rules.numbering.padding),
    "0",
  )
  return rules.numbering.position === "prefix"
    ? `${sample}${rules.numbering.separator}…`
    : `…${rules.numbering.separator}${sample}`
}

function summarizeCase(c: CaseTransform): string {
  switch (c) {
    case "lower":
      return "lowercase"
    case "upper":
      return "UPPERCASE"
    case "title":
      return "Title Case"
    default:
      return "Off"
  }
}
