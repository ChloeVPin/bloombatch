import { useState, type CSSProperties } from 'react';
import { main } from '../../wailsjs/go/models';
import { OpenFileDialog } from '../../wailsjs/go/main/App';

interface DropPageProps {
  files: main.FileInfo[];
  onFilesAdded: (files: main.FileInfo[]) => void;
  onNext: () => void;
}

export default function DropPage({ files, onFilesAdded, onNext }: DropPageProps) {
  const [error, setError] = useState('');

  const handleBrowse = async () => {
    setError('');
    try {
      const infos = await OpenFileDialog();
      if (infos && infos.length > 0) {
        onFilesAdded(infos);
      }
    } catch {
      setError('Failed to open file picker. Please try again.');
    }
  };

  return (
    <div className="flex flex-col flex-1 px-6">
      <div
        className="dropzone flex flex-col items-center justify-center flex-1 rounded-xl border-2 border-dashed border-border bg-surface-raised hover:border-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all cursor-pointer"
        style={{ '--wails-drop-target': 'drop' } as CSSProperties}
        onClick={handleBrowse}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleBrowse();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Drop files here or click to browse"
      >
        <div className="w-14 h-14 rounded-full bg-accent-subtle flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent">
            <path d="M12 10V16M12 10L10 12M12 10L14 12M12.0627 6.06274L11.9373 5.93726C11.5914 5.59135 11.4184 5.4184 11.2166 5.29472C11.0376 5.18506 10.8425 5.10425 10.6385 5.05526C10.4083 5 10.1637 5 9.67452 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V15.8C3 16.9201 3 17.4802 3.21799 17.908C3.40973 18.2843 3.71569 18.5903 4.09202 18.782C4.51984 19 5.07989 19 6.2 19H17.8C18.9201 19 19.4802 19 19.908 18.782C20.2843 18.5903 20.5903 18.2843 20.782 17.908C21 17.4802 21 16.9201 21 15.8V10.2C21 9.0799 21 8.51984 20.782 8.09202C20.5903 7.71569 20.2843 7.40973 19.908 7.21799C19.4802 7 18.9201 7 17.8 7H14.3255C13.8363 7 13.5917 7 13.3615 6.94474C13.1575 6.89575 12.9624 6.81494 12.7834 6.70528C12.5816 6.5816 12.4086 6.40865 12.0627 6.06274Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-sm font-medium text-text-secondary">Drop files here</p>
        <p className="text-xs text-text-tertiary mt-1">or click to browse</p>
      </div>

      {error !== '' && <p className="pt-3 text-xs text-red-600">{error}</p>}

      {files.length > 0 && (
        <div className="flex items-center justify-between pt-4">
          <span className="text-xs text-text-tertiary">{files.length} file{files.length !== 1 ? 's' : ''} selected</span>
          <button onClick={onNext} className="px-5 py-2 text-xs font-semibold rounded-lg text-white bg-accent hover:bg-accent-hover transition-colors cursor-pointer">Next</button>
        </div>
      )}
    </div>
  );
}
