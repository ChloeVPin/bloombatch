package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

// FileInfo represents a file selected by the user
type FileInfo struct {
	FullPath string `json:"fullPath"`
	Dir      string `json:"dir"`
	Name     string `json:"name"`
	Ext      string `json:"ext"`
	Size     int64  `json:"size"`
}

// RenameRule defines a single rename operation
type RenameRule struct {
	Type        string `json:"type"`        // "prefix", "suffix", "replace", "autonumber", "case"
	Prefix      string `json:"prefix"`      // for type "prefix"
	Suffix      string `json:"suffix"`      // for type "suffix"
	SearchText  string `json:"searchText"`  // for type "replace"
	ReplaceText string `json:"replaceText"` // for type "replace"
	StartNum    int    `json:"startNum"`    // for type "autonumber"
	Padding     int    `json:"padding"`     // for type "autonumber"
	CaseMode    string `json:"caseMode"`    // "lower" or "upper" for type "case"
}

// PreviewResult holds original and new filename for preview
type PreviewResult struct {
	OriginalName string `json:"originalName"`
	NewName      string `json:"newName"`
	FullPath     string `json:"fullPath"`
	Dir          string `json:"dir"`
	HasConflict  bool   `json:"hasConflict"`
}

// RenameResult holds the result of a rename operation
type RenameResult struct {
	Success      bool   `json:"success"`
	OriginalPath string `json:"originalPath"`
	NewPath      string `json:"newPath"`
	Error        string `json:"error"`
}

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// domReady is called after the frontend DOM is ready
func (a *App) domReady(ctx context.Context) {
	// Drag-and-drop is handled on the JS side via OnFileDrop runtime
}

// OpenFileDialog opens a native file picker and returns selected file paths
func (a *App) OpenFileDialog() ([]FileInfo, error) {
	paths, err := wailsRuntime.OpenMultipleFilesDialog(a.ctx, wailsRuntime.OpenDialogOptions{
		Title: "Select files to rename",
	})
	if err != nil {
		return nil, err
	}
	return a.GetFileInfos(paths)
}

// GetFileInfos converts file paths to FileInfo structs
func (a *App) GetFileInfos(paths []string) ([]FileInfo, error) {
	var files []FileInfo
	for _, p := range paths {
		info, err := os.Stat(p)
		if err != nil {
			continue
		}
		if info.IsDir() {
			continue
		}
		ext := filepath.Ext(p)
		name := strings.TrimSuffix(filepath.Base(p), ext)
		files = append(files, FileInfo{
			FullPath: p,
			Dir:      filepath.Dir(p),
			Name:     name,
			Ext:      ext,
			Size:     info.Size(),
		})
	}
	return files, nil
}

// PreviewRename generates a preview of what filenames will look like after applying rules
func (a *App) PreviewRename(files []FileInfo, rules []RenameRule) []PreviewResult {
	results := make([]PreviewResult, len(files))
	seenNames := make(map[string]int)

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
				num := rule.StartNum + i
				numStr := fmt.Sprintf("%0*d", padding, num)
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

		results[i] = PreviewResult{
			OriginalName: f.Name + f.Ext,
			NewName:      fullNewName,
			FullPath:     f.FullPath,
			Dir:          f.Dir,
			HasConflict:  false,
		}

		if count, exists := seenNames[key]; exists {
			results[i].HasConflict = true
			// Mark the first occurrence as conflicting too
			results[count].HasConflict = true
		}
		seenNames[key] = i
	}

	return results
}

// ApplyRename performs the actual file renaming on disk
func (a *App) ApplyRename(previews []PreviewResult) []RenameResult {
	results := make([]RenameResult, len(previews))

	for i, p := range previews {
		oldPath := p.FullPath
		newPath := filepath.Join(p.Dir, p.NewName)

		results[i] = RenameResult{
			OriginalPath: oldPath,
			NewPath:      newPath,
		}

		if oldPath == newPath {
			results[i].Success = true
			continue
		}

		// Check if target already exists (and isn't the source itself)
		if _, err := os.Stat(newPath); err == nil {
			if !strings.EqualFold(oldPath, newPath) {
				results[i].Success = false
				results[i].Error = "target file already exists"
				continue
			}
		}

		// For case-only renames on Windows, use a temp intermediate name
		if strings.EqualFold(oldPath, newPath) && oldPath != newPath {
			tmpPath := oldPath + ".bloombatch_tmp"
			if err := os.Rename(oldPath, tmpPath); err != nil {
				results[i].Success = false
				results[i].Error = err.Error()
				continue
			}
			if err := os.Rename(tmpPath, newPath); err != nil {
				// Try to restore
				_ = os.Rename(tmpPath, oldPath)
				results[i].Success = false
				results[i].Error = err.Error()
				continue
			}
		} else {
			if err := os.Rename(oldPath, newPath); err != nil {
				results[i].Success = false
				results[i].Error = err.Error()
				continue
			}
		}

		results[i].Success = true
	}

	return results
}
