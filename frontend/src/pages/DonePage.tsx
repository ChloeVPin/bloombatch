import { Check, RotateCcw } from 'lucide-react';

interface DonePageProps {
  count: number;
  errorMessage: string;
  onStartOver: () => void;
}

export default function DonePage({ count, errorMessage, onStartOver }: DonePageProps) {
  const isError = errorMessage.length > 0;

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 gap-5">
      {!isError ? (
        <>
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
            <Check className="w-6 h-6 text-emerald-500" strokeWidth={2} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-text-primary">
              {count} file{count !== 1 ? 's' : ''} renamed
            </p>
            <p className="text-xs text-text-tertiary mt-1">All files renamed successfully</p>
          </div>
        </>
      ) : (
        <>
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <span className="text-xl text-red-400">!</span>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-text-primary">Something went wrong</p>
            <p className="text-xs text-text-tertiary mt-1">{errorMessage}</p>
          </div>
        </>
      )}

      <button
        onClick={onStartOver}
        className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-text-secondary bg-surface-raised hover:bg-surface-hover border border-border rounded-lg transition-colors cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Start over
      </button>
    </div>
  );
}
