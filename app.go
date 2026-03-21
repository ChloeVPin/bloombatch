package main

import (
	"context"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	goRuntime "runtime"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

type FileInfo struct {
	FullPath string `json:"fullPath"`
	Dir      string `json:"dir"`
	Name     string `json:"name"`
	Ext      string `json:"ext"`
	Size     int64  `json:"size"`
}

type RenameRule struct {
	Type        string `json:"type"`
	Prefix      string `json:"prefix"`
	Suffix      string `json:"suffix"`
	SearchText  string `json:"searchText"`
	ReplaceText string `json:"replaceText"`
	StartNum    int    `json:"startNum"`
	Padding     int    `json:"padding"`
	CaseMode    string `json:"caseMode"`
}

type PreviewResult struct {
	OriginalName string `json:"originalName"`
	NewName      string `json:"newName"`
	FullPath     string `json:"fullPath"`
	Dir          string `json:"dir"`
	HasConflict  bool   `json:"hasConflict"`
	ConflictNote string `json:"conflictNote"`
}

type RenameResult struct {
	Success      bool   `json:"success"`
	OriginalPath string `json:"originalPath"`
	NewPath      string `json:"newPath"`
	Error        string `json:"error"`
}

type App struct {
	ctx context.Context
}

type renamePlan struct {
	index    int
	oldPath  string
	newPath  string
	tempPath string
}

var windowsReservedNames = map[string]struct{}{
	"CON": {}, "PRN": {}, "AUX": {}, "NUL": {},
	"COM1": {}, "COM2": {}, "COM3": {}, "COM4": {}, "COM5": {}, "COM6": {}, "COM7": {}, "COM8": {}, "COM9": {},
	"LPT1": {}, "LPT2": {}, "LPT3": {}, "LPT4": {}, "LPT5": {}, "LPT6": {}, "LPT7": {}, "LPT8": {}, "LPT9": {},
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) domReady(ctx context.Context) {
}

func (a *App) OpenFileDialog() ([]FileInfo, error) {
	paths, err := wailsRuntime.OpenMultipleFilesDialog(a.ctx, wailsRuntime.OpenDialogOptions{Title: "Select files to rename"})
	if err != nil {
		return nil, err
	}
	return a.GetFileInfos(paths)
}

func (a *App) GetFileInfos(paths []string) ([]FileInfo, error) {
	files := make([]FileInfo, 0, len(paths))
	for _, p := range paths {
		info, err := os.Stat(p)
		if err != nil || info.IsDir() {
			continue
		}
		ext := filepath.Ext(p)
		name := strings.TrimSuffix(filepath.Base(p), ext)
		files = append(files, FileInfo{FullPath: p, Dir: filepath.Dir(p), Name: name, Ext: ext, Size: info.Size()})
	}
	return files, nil
}

func (a *App) PreviewRename(files []FileInfo, rules []RenameRule) []PreviewResult {
	results := make([]PreviewResult, len(files))
	seenNames := make(map[string]int)
	sourceNames := make(map[string]struct{}, len(files))

	for _, f := range files {
		sourceNames[normalizePathForCompare(f.FullPath)] = struct{}{}
	}

	for i, f := range files {
		newName := f.Name
		newExt := f.Ext

		for _, rule := range rules {
			switch rule.Type {
			case "prefix":
				if rule.Prefix != "" {
					newName = rule.Prefix + newName
				}
			case "suffix":
				if rule.Suffix != "" {
					newName = newName + rule.Suffix
				}
			case "replace":
				if rule.SearchText != "" {
					newName = strings.ReplaceAll(newName, rule.SearchText, rule.ReplaceText)
				}
			case "autonumber":
				padding := rule.Padding
				if padding < 1 {
					padding = 3
				}
				numStr := fmt.Sprintf("%0*d", padding, rule.StartNum+i)
				newName = numStr + "_" + newName
			case "case":
				switch rule.CaseMode {
				case "lower":
					newName = strings.ToLower(newName)
					newExt = strings.ToLower(newExt)
				case "upper":
					newName = strings.ToUpper(newName)
					newExt = strings.ToUpper(newExt)
				}
			}
		}

		fullNewName := newName + newExt
		key := strings.ToLower(filepath.Join(f.Dir, fullNewName))

		results[i] = PreviewResult{OriginalName: f.Name + f.Ext, NewName: fullNewName, FullPath: f.FullPath, Dir: f.Dir}

		if err := validateTargetFilename(fullNewName); err != nil {
			addConflict(&results[i], err.Error())
		}

		if count, exists := seenNames[key]; exists {
			addConflict(&results[i], "conflicts with another selected file")
			addConflict(&results[count], "conflicts with another selected file")
		} else {
			seenNames[key] = i
		}

		targetPath := filepath.Join(f.Dir, fullNewName)
		if info, err := os.Stat(targetPath); err == nil {
			targetKey := normalizePathForCompare(targetPath)
			if !isSamePath(targetPath, f.FullPath) {
				if _, selected := sourceNames[targetKey]; !selected {
					if info.IsDir() {
						addConflict(&results[i], "target path already exists as a directory")
					} else {
						addConflict(&results[i], "target file already exists on disk")
					}
				}
			}
		} else if !errors.Is(err, os.ErrNotExist) {
			addConflict(&results[i], "cannot verify target path")
		}
	}

	return results
}

func (a *App) ApplyRename(previews []PreviewResult) []RenameResult {
	results := make([]RenameResult, len(previews))
	plans := make([]renamePlan, 0, len(previews))
	hasPreflightError := false

	for i, p := range previews {
		oldPath := filepath.Clean(p.FullPath)
		newPath := filepath.Join(p.Dir, p.NewName)
		results[i] = RenameResult{OriginalPath: oldPath, NewPath: newPath}

		if isSamePath(oldPath, newPath) {
			results[i].Success = true
			continue
		}

		if err := validateTargetFilename(p.NewName); err != nil {
			results[i].Error = err.Error()
			hasPreflightError = true
			continue
		}

		plans = append(plans, renamePlan{index: i, oldPath: oldPath, newPath: newPath})
	}

	if hasPreflightError {
		return results
	}

	targetOwners := make(map[string]int, len(plans))
	sourceSet := make(map[string]struct{}, len(plans))
	for _, plan := range plans {
		sourceSet[normalizePathForCompare(plan.oldPath)] = struct{}{}
	}

	for _, plan := range plans {
		oldInfo, err := os.Stat(plan.oldPath)
		if err != nil {
			setResultError(results, plan.index, fmt.Sprintf("source file is not available: %v", err))
			hasPreflightError = true
			continue
		}
		if oldInfo.IsDir() {
			setResultError(results, plan.index, "source path is a directory")
			hasPreflightError = true
			continue
		}

		targetKey := normalizePathForCompare(plan.newPath)
		if other, exists := targetOwners[targetKey]; exists {
			setResultError(results, plan.index, "target conflicts with another selected file")
			setResultError(results, other, "target conflicts with another selected file")
			hasPreflightError = true
			continue
		}
		targetOwners[targetKey] = plan.index

		if info, err := os.Stat(plan.newPath); err == nil {
			if _, selected := sourceSet[targetKey]; !selected {
				if info.IsDir() {
					setResultError(results, plan.index, "target path already exists as a directory")
				} else {
					setResultError(results, plan.index, "target file already exists")
				}
				hasPreflightError = true
			}
		} else if !errors.Is(err, os.ErrNotExist) {
			setResultError(results, plan.index, fmt.Sprintf("cannot access target path: %v", err))
			hasPreflightError = true
		}
	}

	if hasPreflightError {
		return results
	}

	for i := range plans {
		tmp, err := generateTempPath(plans[i].oldPath)
		if err != nil {
			setResultError(results, plans[i].index, fmt.Sprintf("failed to prepare temporary path: %v", err))
			rollbackFromTemp(plans[:i], results)
			return results
		}
		plans[i].tempPath = tmp
		if err := os.Rename(plans[i].oldPath, plans[i].tempPath); err != nil {
			setResultError(results, plans[i].index, fmt.Sprintf("failed during rename staging: %v", err))
			rollbackFromTemp(plans[:i], results)
			return results
		}
	}

	for i := range plans {
		if err := os.Rename(plans[i].tempPath, plans[i].newPath); err != nil {
			setResultError(results, plans[i].index, fmt.Sprintf("failed to finalize rename: %v", err))
			rollbackAfterFinalizeFailure(plans, i, results)
			return results
		}
		results[plans[i].index].Success = true
	}

	return results
}

func rollbackFromTemp(staged []renamePlan, results []RenameResult) {
	for i := len(staged) - 1; i >= 0; i-- {
		p := staged[i]
		if p.tempPath == "" {
			continue
		}
		if err := os.Rename(p.tempPath, p.oldPath); err != nil {
			appendResultError(results, p.index, fmt.Sprintf("rollback failed: %v", err))
			continue
		}
		setResultError(results, p.index, "rename aborted and rolled back")
	}
}

func rollbackAfterFinalizeFailure(plans []renamePlan, failureIndex int, results []RenameResult) {
	for i := failureIndex; i < len(plans); i++ {
		p := plans[i]
		if p.tempPath == "" {
			continue
		}
		if err := os.Rename(p.tempPath, p.oldPath); err != nil {
			appendResultError(results, p.index, fmt.Sprintf("rollback failed: %v", err))
		} else if results[p.index].Error == "" {
			setResultError(results, p.index, "rename aborted and rolled back")
		}
	}
	for i := failureIndex - 1; i >= 0; i-- {
		p := plans[i]
		if err := os.Rename(p.newPath, p.oldPath); err != nil {
			appendResultError(results, p.index, fmt.Sprintf("rollback failed after partial success: %v", err))
		} else {
			setResultError(results, p.index, "rename aborted and rolled back")
		}
	}
}

func setResultError(results []RenameResult, index int, message string) {
	results[index].Success = false
	results[index].Error = message
}

func appendResultError(results []RenameResult, index int, message string) {
	results[index].Success = false
	if results[index].Error == "" {
		results[index].Error = message
		return
	}
	results[index].Error += "; " + message
}

func addConflict(result *PreviewResult, note string) {
	result.HasConflict = true
	if result.ConflictNote == "" {
		result.ConflictNote = note
		return
	}
	if !strings.Contains(result.ConflictNote, note) {
		result.ConflictNote += "; " + note
	}
}

func validateTargetFilename(name string) error {
	if name == "" {
		return errors.New("target filename is empty")
	}
	if filepath.Base(name) != name || strings.ContainsAny(name, `/\\`) {
		return errors.New("target filename must not contain path separators")
	}
	if name == "." || name == ".." {
		return errors.New("target filename is invalid")
	}
	if strings.HasSuffix(name, ".") || strings.HasSuffix(name, " ") {
		return errors.New("target filename cannot end with a dot or space")
	}
	if utf8.RuneCountInString(name) > 255 {
		return errors.New("target filename exceeds 255 characters")
	}
	if strings.ContainsAny(name, "<>:\"/\\|?*") {
		return errors.New("target filename contains invalid characters")
	}
	for _, r := range name {
		if r >= 0 && r < 32 {
			return errors.New("target filename contains control characters")
		}
	}
	base := strings.TrimSuffix(name, filepath.Ext(name))
	base = strings.TrimRight(base, ". ")
	if base == "" {
		return errors.New("target filename is invalid")
	}
	if _, reserved := windowsReservedNames[strings.ToUpper(base)]; reserved {
		return errors.New("target filename is reserved on Windows")
	}
	return nil
}

func normalizePathForCompare(path string) string {
	clean := filepath.Clean(path)
	if goRuntime.GOOS == "windows" {
		return strings.ToLower(clean)
	}
	return clean
}

func isSamePath(a, b string) bool {
	return normalizePathForCompare(a) == normalizePathForCompare(b)
}

func generateTempPath(originalPath string) (string, error) {
	dir := filepath.Dir(originalPath)
	base := filepath.Base(originalPath)
	prefix := "." + base + ".bloombatch_tmp_"
	for attempt := range 1000 {
		candidate := filepath.Join(dir, prefix+strconv.FormatInt(time.Now().UnixNano(), 36)+"_"+strconv.Itoa(attempt))
		if _, err := os.Stat(candidate); errors.Is(err, os.ErrNotExist) {
			return candidate, nil
		}
	}
	return "", errors.New("unable to allocate temporary file path")
}
