package main

import (
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

type cliError struct {
	Message string `json:"error"`
}

type cliRenameOutput struct {
	Previews     []PreviewResult `json:"previews"`
	Results      []RenameResult  `json:"results,omitempty"`
	HasConflicts bool            `json:"hasConflicts"`
}

func runCLI(args []string, stdout io.Writer, stderr io.Writer) int {
	if len(args) == 0 {
		writeCLIUsage(stdout)
		return 0
	}

	switch args[0] {
	case "help", "-h", "--help":
		writeCLIUsage(stdout)
		return 0
	case "info":
		return runCLIInfo(args[1:], stdout, stderr)
	case "preview":
		return runCLIPreview(args[1:], stdout, stderr)
	case "apply":
		return runCLIApply(args[1:], stdout, stderr)
	case "rename":
		return runCLIRename(args[1:], stdout, stderr)
	case "selftest":
		return runCLISelfTest(stdout, stderr)
	default:
		writeCLIError(stderr, fmt.Sprintf("unknown command: %s", args[0]))
		writeCLIUsage(stderr)
		return 2
	}
}

func runCLIInfo(args []string, stdout io.Writer, stderr io.Writer) int {
	fs := flag.NewFlagSet("info", flag.ContinueOnError)
	fs.SetOutput(stderr)
	pathsArg := fs.String("paths", "", "Comma- or semicolon-separated file paths")
	pathsFile := fs.String("paths-file", "", "Text file containing one path per line")
	if err := fs.Parse(args); err != nil {
		return 2
	}

	paths, err := collectPaths(*pathsArg, *pathsFile)
	if err != nil {
		writeCLIError(stderr, err.Error())
		return 1
	}

	app := NewApp()
	infos, err := app.GetFileInfos(paths)
	if err != nil {
		writeCLIError(stderr, err.Error())
		return 1
	}

	writeJSON(stdout, infos)
	return 0
}

func runCLIPreview(args []string, stdout io.Writer, stderr io.Writer) int {
	fs := flag.NewFlagSet("preview", flag.ContinueOnError)
	fs.SetOutput(stderr)
	pathsArg := fs.String("paths", "", "Comma- or semicolon-separated file paths")
	pathsFile := fs.String("paths-file", "", "Text file containing one path per line")
	rulesJSON := fs.String("rules-json", "", "JSON array of rename rules")
	rulesFile := fs.String("rules-file", "", "File containing JSON array of rename rules")
	if err := fs.Parse(args); err != nil {
		return 2
	}

	files, err := loadFilesForCLI(*pathsArg, *pathsFile)
	if err != nil {
		writeCLIError(stderr, err.Error())
		return 1
	}

	rules, err := parseRulesInput(*rulesJSON, *rulesFile)
	if err != nil {
		writeCLIError(stderr, err.Error())
		return 1
	}

	app := NewApp()
	previews := app.PreviewRename(files, rules)
	writeJSON(stdout, previews)
	return 0
}

func runCLIApply(args []string, stdout io.Writer, stderr io.Writer) int {
	fs := flag.NewFlagSet("apply", flag.ContinueOnError)
	fs.SetOutput(stderr)
	previewJSON := fs.String("preview-json", "", "JSON array of preview results")
	previewFile := fs.String("preview-file", "", "File containing JSON array of preview results")
	if err := fs.Parse(args); err != nil {
		return 2
	}

	previews, err := parsePreviewInput(*previewJSON, *previewFile)
	if err != nil {
		writeCLIError(stderr, err.Error())
		return 1
	}

	app := NewApp()
	results := app.ApplyRename(previews)
	writeJSON(stdout, results)

	for _, result := range results {
		if !result.Success {
			return 3
		}
	}
	return 0
}

func runCLIRename(args []string, stdout io.Writer, stderr io.Writer) int {
	fs := flag.NewFlagSet("rename", flag.ContinueOnError)
	fs.SetOutput(stderr)
	pathsArg := fs.String("paths", "", "Comma- or semicolon-separated file paths")
	pathsFile := fs.String("paths-file", "", "Text file containing one path per line")
	rulesJSON := fs.String("rules-json", "", "JSON array of rename rules")
	rulesFile := fs.String("rules-file", "", "File containing JSON array of rename rules")
	dryRun := fs.Bool("dry-run", false, "Preview only; do not rename files")
	if err := fs.Parse(args); err != nil {
		return 2
	}

	files, err := loadFilesForCLI(*pathsArg, *pathsFile)
	if err != nil {
		writeCLIError(stderr, err.Error())
		return 1
	}

	rules, err := parseRulesInput(*rulesJSON, *rulesFile)
	if err != nil {
		writeCLIError(stderr, err.Error())
		return 1
	}

	app := NewApp()
	previews := app.PreviewRename(files, rules)

	out := cliRenameOutput{
		Previews: previews,
	}
	for _, preview := range previews {
		if preview.HasConflict {
			out.HasConflicts = true
			break
		}
	}

	if *dryRun || out.HasConflicts {
		writeJSON(stdout, out)
		if out.HasConflicts {
			return 3
		}
		return 0
	}

	out.Results = app.ApplyRename(previews)
	writeJSON(stdout, out)

	for _, result := range out.Results {
		if !result.Success {
			return 3
		}
	}
	return 0
}

func runCLISelfTest(stdout io.Writer, stderr io.Writer) int {
	dir, err := os.MkdirTemp("", "bloombatch-cli-selftest-*")
	if err != nil {
		writeCLIError(stderr, fmt.Sprintf("failed to create temp dir: %v", err))
		return 1
	}
	defer os.RemoveAll(dir)

	aPath := filepath.Join(dir, "a.txt")
	bPath := filepath.Join(dir, "b.txt")
	existingPath := filepath.Join(dir, "existing.txt")

	if err := os.WriteFile(aPath, []byte("A"), 0o644); err != nil {
		writeCLIError(stderr, fmt.Sprintf("failed to write fixture: %v", err))
		return 1
	}
	if err := os.WriteFile(bPath, []byte("B"), 0o644); err != nil {
		writeCLIError(stderr, fmt.Sprintf("failed to write fixture: %v", err))
		return 1
	}
	if err := os.WriteFile(existingPath, []byte("E"), 0o644); err != nil {
		writeCLIError(stderr, fmt.Sprintf("failed to write fixture: %v", err))
		return 1
	}

	app := NewApp()
	files, err := app.GetFileInfos([]string{aPath, bPath})
	if err != nil {
		writeCLIError(stderr, fmt.Sprintf("GetFileInfos failed: %v", err))
		return 1
	}
	if len(files) != 2 {
		writeCLIError(stderr, "selftest failed: expected 2 file infos")
		return 1
	}

	swapPreviews := []PreviewResult{
		{FullPath: aPath, Dir: dir, NewName: "b.txt"},
		{FullPath: bPath, Dir: dir, NewName: "a.txt"},
	}
	swapResults := app.ApplyRename(swapPreviews)
	for _, result := range swapResults {
		if !result.Success {
			writeCLIError(stderr, fmt.Sprintf("selftest failed: swap rename failed: %s", result.Error))
			return 1
		}
	}

	contentA, err := os.ReadFile(filepath.Join(dir, "a.txt"))
	if err != nil || string(contentA) != "B" {
		writeCLIError(stderr, "selftest failed: swap verification for a.txt failed")
		return 1
	}
	contentB, err := os.ReadFile(filepath.Join(dir, "b.txt"))
	if err != nil || string(contentB) != "A" {
		writeCLIError(stderr, "selftest failed: swap verification for b.txt failed")
		return 1
	}

	conflictPreview := app.PreviewRename([]FileInfo{
		{
			FullPath: filepath.Join(dir, "a.txt"),
			Dir:      dir,
			Name:     "a",
			Ext:      ".txt",
		},
	}, []RenameRule{
		{
			Type:        "replace",
			SearchText:  "a",
			ReplaceText: "existing",
		},
	})

	if len(conflictPreview) != 1 || !conflictPreview[0].HasConflict {
		writeCLIError(stderr, "selftest failed: expected existing-file conflict")
		return 1
	}

	writeJSON(stdout, map[string]any{
		"ok":      true,
		"tempDir": dir,
	})
	return 0
}

func loadFilesForCLI(pathsArg string, pathsFile string) ([]FileInfo, error) {
	paths, err := collectPaths(pathsArg, pathsFile)
	if err != nil {
		return nil, err
	}
	app := NewApp()
	files, err := app.GetFileInfos(paths)
	if err != nil {
		return nil, err
	}
	if len(files) == 0 {
		return nil, errors.New("no valid files found")
	}
	return files, nil
}

func parseRulesInput(jsonArg string, jsonFile string) ([]RenameRule, error) {
	if strings.TrimSpace(jsonArg) == "" && strings.TrimSpace(jsonFile) == "" {
		return nil, errors.New("missing rules input: provide --rules-json or --rules-file")
	}
	if strings.TrimSpace(jsonArg) != "" && strings.TrimSpace(jsonFile) != "" {
		return nil, errors.New("provide either --rules-json or --rules-file, not both")
	}

	raw := jsonArg
	if strings.TrimSpace(jsonFile) != "" {
		fileBytes, err := os.ReadFile(jsonFile)
		if err != nil {
			return nil, fmt.Errorf("failed reading rules file: %w", err)
		}
		raw = string(fileBytes)
	}

	var rules []RenameRule
	if err := json.Unmarshal([]byte(raw), &rules); err != nil {
		return nil, fmt.Errorf("invalid rules json: %w", err)
	}
	return rules, nil
}

func parsePreviewInput(jsonArg string, jsonFile string) ([]PreviewResult, error) {
	if strings.TrimSpace(jsonArg) == "" && strings.TrimSpace(jsonFile) == "" {
		return nil, errors.New("missing preview input: provide --preview-json or --preview-file")
	}
	if strings.TrimSpace(jsonArg) != "" && strings.TrimSpace(jsonFile) != "" {
		return nil, errors.New("provide either --preview-json or --preview-file, not both")
	}

	raw := jsonArg
	if strings.TrimSpace(jsonFile) != "" {
		fileBytes, err := os.ReadFile(jsonFile)
		if err != nil {
			return nil, fmt.Errorf("failed reading preview file: %w", err)
		}
		raw = string(fileBytes)
	}

	var previews []PreviewResult
	if err := json.Unmarshal([]byte(raw), &previews); err != nil {
		return nil, fmt.Errorf("invalid preview json: %w", err)
	}
	return previews, nil
}

func collectPaths(pathsArg string, pathsFile string) ([]string, error) {
	paths := make([]string, 0, 8)
	paths = append(paths, splitPathInput(pathsArg)...)

	if strings.TrimSpace(pathsFile) != "" {
		data, err := os.ReadFile(pathsFile)
		if err != nil {
			return nil, fmt.Errorf("failed reading paths file: %w", err)
		}
		paths = append(paths, splitPathInput(string(data))...)
	}

	unique := make([]string, 0, len(paths))
	seen := make(map[string]struct{}, len(paths))
	for _, p := range paths {
		clean := strings.TrimSpace(p)
		if clean == "" {
			continue
		}
		if _, exists := seen[clean]; exists {
			continue
		}
		seen[clean] = struct{}{}
		unique = append(unique, clean)
	}

	if len(unique) == 0 {
		return nil, errors.New("no paths provided; use --paths and/or --paths-file")
	}
	return unique, nil
}

func splitPathInput(raw string) []string {
	if strings.TrimSpace(raw) == "" {
		return nil
	}
	normalized := strings.NewReplacer("\r\n", "\n", "\r", "\n", ";", "\n", ",", "\n").Replace(raw)
	return strings.Split(normalized, "\n")
}

func writeJSON(out io.Writer, value any) {
	encoder := json.NewEncoder(out)
	encoder.SetIndent("", "  ")
	_ = encoder.Encode(value)
}

func writeCLIError(out io.Writer, message string) {
	writeJSON(out, cliError{Message: message})
}

func writeCLIUsage(out io.Writer) {
	_, _ = fmt.Fprint(out, `bloombatch CLI

Usage:
  bloombatch cli <command> [flags]

Commands:
  info      Resolve file metadata from paths
  preview   Generate rename preview from files + rules
  apply     Apply previously generated preview JSON
  rename    Preview and apply in one command (supports --dry-run)
  selftest  Run built-in engine smoke tests

Examples:
  bloombatch cli info --paths "C:\a.txt,C:\b.txt"
  bloombatch cli preview --paths-file paths.txt --rules-file rules.json
  bloombatch cli rename --paths "C:\a.txt;C:\b.txt" --rules-json "[{\"type\":\"prefix\",\"prefix\":\"new_\"}]"
  bloombatch cli rename --paths-file paths.txt --rules-file rules.json --dry-run
`)
}
