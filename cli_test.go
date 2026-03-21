package main

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

func TestCLIInfo(t *testing.T) {
	t.Parallel()

	dir := t.TempDir()
	filePath := filepath.Join(dir, "alpha.txt")
	if err := os.WriteFile(filePath, []byte("alpha"), 0o644); err != nil {
		t.Fatalf("write fixture: %v", err)
	}

	var stdout bytes.Buffer
	var stderr bytes.Buffer
	code := runCLI([]string{"info", "--paths", filePath}, &stdout, &stderr)
	if code != 0 {
		t.Fatalf("expected success code, got %d, stderr=%s", code, stderr.String())
	}

	var infos []FileInfo
	if err := json.Unmarshal(stdout.Bytes(), &infos); err != nil {
		t.Fatalf("unmarshal stdout: %v", err)
	}
	if len(infos) != 1 {
		t.Fatalf("expected 1 info, got %d", len(infos))
	}
	if infos[0].FullPath != filePath {
		t.Fatalf("unexpected path: %s", infos[0].FullPath)
	}
}

func TestCLIPreviewAndApply(t *testing.T) {
	t.Parallel()

	dir := t.TempDir()
	filePath := filepath.Join(dir, "sample.txt")
	if err := os.WriteFile(filePath, []byte("sample"), 0o644); err != nil {
		t.Fatalf("write fixture: %v", err)
	}

	var previewOut bytes.Buffer
	var previewErr bytes.Buffer
	rules := `[{"type":"prefix","prefix":"new_"}]`
	code := runCLI([]string{"preview", "--paths", filePath, "--rules-json", rules}, &previewOut, &previewErr)
	if code != 0 {
		t.Fatalf("preview failed: code=%d stderr=%s", code, previewErr.String())
	}

	var previews []PreviewResult
	if err := json.Unmarshal(previewOut.Bytes(), &previews); err != nil {
		t.Fatalf("unmarshal previews: %v", err)
	}
	if len(previews) != 1 {
		t.Fatalf("expected 1 preview, got %d", len(previews))
	}
	if previews[0].NewName != "new_sample.txt" {
		t.Fatalf("unexpected preview name: %s", previews[0].NewName)
	}

	var applyOut bytes.Buffer
	var applyErr bytes.Buffer
	previewJSON := previewOut.String()
	code = runCLI([]string{"apply", "--preview-json", previewJSON}, &applyOut, &applyErr)
	if code != 0 {
		t.Fatalf("apply failed: code=%d stderr=%s", code, applyErr.String())
	}

	if _, err := os.Stat(filepath.Join(dir, "new_sample.txt")); err != nil {
		t.Fatalf("expected renamed file: %v", err)
	}
}

func TestCLIRenameDryRunAndConflictExitCode(t *testing.T) {
	t.Parallel()

	dir := t.TempDir()
	sourcePath := filepath.Join(dir, "alpha.txt")
	conflictPath := filepath.Join(dir, "target.txt")
	if err := os.WriteFile(sourcePath, []byte("a"), 0o644); err != nil {
		t.Fatalf("write source: %v", err)
	}
	if err := os.WriteFile(conflictPath, []byte("b"), 0o644); err != nil {
		t.Fatalf("write conflict: %v", err)
	}

	var stdout bytes.Buffer
	var stderr bytes.Buffer
	rules := `[{"type":"replace","searchText":"alpha","replaceText":"target"}]`
	code := runCLI([]string{"rename", "--paths", sourcePath, "--rules-json", rules, "--dry-run"}, &stdout, &stderr)
	if code != 3 {
		t.Fatalf("expected conflict exit code 3, got %d stderr=%s", code, stderr.String())
	}

	var out cliRenameOutput
	if err := json.Unmarshal(stdout.Bytes(), &out); err != nil {
		t.Fatalf("unmarshal output: %v", err)
	}
	if !out.HasConflicts {
		t.Fatal("expected hasConflicts=true")
	}
}

func TestCLISelfTest(t *testing.T) {
	t.Parallel()

	var stdout bytes.Buffer
	var stderr bytes.Buffer
	code := runCLI([]string{"selftest"}, &stdout, &stderr)
	if code != 0 {
		t.Fatalf("selftest failed: code=%d stderr=%s", code, stderr.String())
	}

	var result map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &result); err != nil {
		t.Fatalf("unmarshal selftest output: %v", err)
	}
	ok, _ := result["ok"].(bool)
	if !ok {
		t.Fatalf("unexpected selftest output: %s", stdout.String())
	}
}
