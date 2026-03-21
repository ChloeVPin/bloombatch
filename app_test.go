package main

import (
	"os"
	"path/filepath"
	"testing"
)

func TestPreviewRenameFlagsInvalidAndExistingConflicts(t *testing.T) {
	t.Parallel()

	dir := t.TempDir()
	source := filepath.Join(dir, "alpha.txt")
	existing := filepath.Join(dir, "target.txt")

	if err := os.WriteFile(source, []byte("a"), 0o644); err != nil {
		t.Fatalf("write source: %v", err)
	}
	if err := os.WriteFile(existing, []byte("b"), 0o644); err != nil {
		t.Fatalf("write existing: %v", err)
	}

	app := NewApp()
	files := []FileInfo{{
		FullPath: source,
		Dir:      dir,
		Name:     "alpha",
		Ext:      ".txt",
	}}

	invalid := app.PreviewRename(files, []RenameRule{{Type: "prefix", Prefix: "<"}})
	if len(invalid) != 1 {
		t.Fatalf("expected one preview result, got %d", len(invalid))
	}
	if !invalid[0].HasConflict {
		t.Fatal("expected invalid filename conflict")
	}

	existingConflict := app.PreviewRename(files, []RenameRule{{Type: "replace", SearchText: "alpha", ReplaceText: "target"}})
	if len(existingConflict) != 1 {
		t.Fatalf("expected one preview result, got %d", len(existingConflict))
	}
	if !existingConflict[0].HasConflict {
		t.Fatal("expected existing-file conflict")
	}
}

func TestApplyRenameHandlesSwap(t *testing.T) {
	t.Parallel()

	dir := t.TempDir()
	fileA := filepath.Join(dir, "a.txt")
	fileB := filepath.Join(dir, "b.txt")

	if err := os.WriteFile(fileA, []byte("A"), 0o644); err != nil {
		t.Fatalf("write a: %v", err)
	}
	if err := os.WriteFile(fileB, []byte("B"), 0o644); err != nil {
		t.Fatalf("write b: %v", err)
	}

	app := NewApp()
	results := app.ApplyRename([]PreviewResult{
		{FullPath: fileA, Dir: dir, NewName: "b.txt"},
		{FullPath: fileB, Dir: dir, NewName: "a.txt"},
	})

	if len(results) != 2 {
		t.Fatalf("expected 2 results, got %d", len(results))
	}
	for i, result := range results {
		if !result.Success {
			t.Fatalf("result %d failed: %s", i, result.Error)
		}
	}

	contentA, err := os.ReadFile(filepath.Join(dir, "a.txt"))
	if err != nil {
		t.Fatalf("read final a: %v", err)
	}
	contentB, err := os.ReadFile(filepath.Join(dir, "b.txt"))
	if err != nil {
		t.Fatalf("read final b: %v", err)
	}

	if string(contentA) != "B" || string(contentB) != "A" {
		t.Fatalf("unexpected swapped content: a=%q b=%q", contentA, contentB)
	}
}

func TestApplyRenameRejectsDuplicateTargets(t *testing.T) {
	t.Parallel()

	dir := t.TempDir()
	fileA := filepath.Join(dir, "a.txt")
	fileB := filepath.Join(dir, "b.txt")

	if err := os.WriteFile(fileA, []byte("A"), 0o644); err != nil {
		t.Fatalf("write a: %v", err)
	}
	if err := os.WriteFile(fileB, []byte("B"), 0o644); err != nil {
		t.Fatalf("write b: %v", err)
	}

	app := NewApp()
	results := app.ApplyRename([]PreviewResult{
		{FullPath: fileA, Dir: dir, NewName: "same.txt"},
		{FullPath: fileB, Dir: dir, NewName: "same.txt"},
	})

	if len(results) != 2 {
		t.Fatalf("expected 2 results, got %d", len(results))
	}
	if results[0].Success || results[1].Success {
		t.Fatal("expected duplicate target preflight failure")
	}

	if _, err := os.Stat(fileA); err != nil {
		t.Fatalf("expected original file a to exist: %v", err)
	}
	if _, err := os.Stat(fileB); err != nil {
		t.Fatalf("expected original file b to exist: %v", err)
	}
}
