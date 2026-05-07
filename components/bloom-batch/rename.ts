export type CaseTransform = "none" | "lower" | "upper" | "title"
export type NumberPosition = "prefix" | "suffix"

export type Rules = {
  find: string
  replace: string
  prefix: string
  suffix: string
  numbering: {
    enabled: boolean
    start: number
    padding: number
    separator: string
    position: NumberPosition
  }
  caseTransform: CaseTransform
}

export const defaultRules: Rules = {
  find: "",
  replace: "",
  prefix: "",
  suffix: "",
  numbering: {
    enabled: false,
    start: 1,
    padding: 2,
    separator: "_",
    position: "prefix",
  },
  caseTransform: "none",
}

/** Describes a file as received from a drop or dialog, before it enters state. */
export type DroppedFile = {
  name: string
  /** Full filesystem path. Empty string when running in a plain browser. */
  path: string
  size: number
}

export type FileItem = {
  id: string
  originalName: string
  /** Full filesystem path. Empty string when running in a plain browser. */
  path: string
  size: number
}

function splitName(name: string): { base: string; ext: string } {
  const idx = name.lastIndexOf(".")
  if (idx <= 0 || idx === name.length - 1) {
    return { base: name, ext: "" }
  }
  return { base: name.slice(0, idx), ext: name.slice(idx) }
}

function applyCase(value: string, mode: CaseTransform): string {
  switch (mode) {
    case "lower":
      return value.toLowerCase()
    case "upper":
      return value.toUpperCase()
    case "title":
      return value
        .toLowerCase()
        .replace(/(^|[\s\-_.])(\p{L})/gu, (_m, sep, ch) => sep + ch.toUpperCase())
    default:
      return value
  }
}

export function applyRules(originalName: string, rules: Rules, index: number): string {
  const { base, ext } = splitName(originalName)
  let next = base

  if (rules.find.length > 0) {
    // Plain string replace, all occurrences, case-insensitive feel via simple split/join.
    next = next.split(rules.find).join(rules.replace)
  }

  next = applyCase(next, rules.caseTransform)

  if (rules.numbering.enabled) {
    const n = String(rules.numbering.start + index).padStart(
      Math.max(1, rules.numbering.padding),
      "0",
    )
    const sep = rules.numbering.separator
    next =
      rules.numbering.position === "prefix"
        ? `${n}${sep}${next}`
        : `${next}${sep}${n}`
  }

  if (rules.prefix) next = `${rules.prefix}${next}`
  if (rules.suffix) next = `${next}${rules.suffix}`

  // Collapse stray double separators introduced by empty bases.
  next = next.replace(/\s+/g, " ").trim()

  return `${next}${ext}`
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}
