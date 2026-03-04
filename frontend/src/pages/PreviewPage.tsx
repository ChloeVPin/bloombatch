import { useEffect, useState } from 'react';
import { main } from '../../wailsjs/go/models';
import { PreviewRename, ApplyRename } from '../../wailsjs/go/main/App';
import { RuleConfig, toBackendRules } from '../types';
import { ChevronLeft, ArrowRight, AlertTriangle } from 'lucide-react';

interface PreviewPageProps {
  files: main.FileInfo[];
  rules: RuleConfig[];
  onBack: () => void;
  onDone: (count: number) => void;
  onError: (msg: string) => void;
}

export default function PreviewPage({ files, rules, onBack, onDone, onError }: PreviewPageProps) {
  const [previews, setPreviews] = useState<main.PreviewResult[]>([]);
  const [renaming, setRenaming] = useState(false);

  useEffect(() => {
    if (files.length > 0 && rules.length > 0) {
      PreviewRename(files, toBackendRules(rules)).then((p) => {
        setPreviews(p || []);
      });
    }
  }, [files, rules]);

  const hasConflicts = previews.some((p) => p.hasConflict);
  const hasChanges = previews.some((p) => p.originalName !== p.newName);

  const handleRename = async () => {
    if (!hasChanges || hasConflicts || renaming) return;
    setRenaming(true);
    try {
      const results = await ApplyRename(previews);
      const failures = results.filter((r) => !r.success);
      if (failures.length === 0) {
        onDone(results.length);
      } else {
        onError(`${failures.length} file(s) failed: ${failures[0]?.error || 'unknown'}`);
      }
    } catch {
      onError('Rename operation failed');
    } finally {
      setRenaming(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* File list */}
      <div className="flex-1 overflow-y-auto px-6">
        {previews.map((p, i) => {
          const changed = p.originalName !== p.newName;
          return (
            <div
              key={p.fullPath}
              className="py-2.5 border-b border-border-light last:border-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[13px] text-text-secondary truncate">
                  {p.originalName}
                </span>
                {changed && (
                  <>
                    <ArrowRight className="w-3 h-3 text-text-tertiary shrink-0" />
                    <span className={`text-[13px] font-medium truncate ${
                      p.hasConflict ? 'text-amber-600' : 'text-text-accent'
                    }`}>
                      {p.newName}
                    </span>
                    {p.hasConflict && (
                      <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                    )}
                  </>
                )}
                {!changed && (
                  <span className="text-[11px] text-text-tertiary italic">no change</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status + Actions */}
      <div className="px-6 pt-3">
        {hasConflicts && (
          <p className="flex items-center gap-1.5 text-xs text-amber-600 mb-3">
            <AlertTriangle className="w-3.5 h-3.5" />
            Naming conflicts — resolve before renaming
          </p>
        )}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <button
            onClick={handleRename}
            disabled={!hasChanges || hasConflicts || renaming}
            className="px-5 py-2 text-xs font-semibold rounded-lg text-white bg-accent hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {renaming ? 'Renaming...' : 'Rename Files'}
          </button>
        </div>
      </div>
    </div>
  );
}
