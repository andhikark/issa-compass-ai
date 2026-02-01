'use client';

import { useMemo, useState } from 'react';
import { diffLines } from 'diff';

interface PromptDiffViewerProps {
  oldPrompt: string;
  newPrompt: string;
}

export default function PromptDiffViewer({
  oldPrompt,
  newPrompt,
}: PromptDiffViewerProps) {
  const [splitView, setSplitView] = useState(true);

  const diff = useMemo(
    () => diffLines(oldPrompt || '', newPrompt || ''),
    [oldPrompt, newPrompt]
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Prompt Changes</h3>
        <button
          onClick={() => setSplitView(!splitView)}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
        >
          {splitView ? 'Unified View' : 'Split View'}
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden text-sm font-mono">
        {diff.map((part, idx) => {
          const bg =
            part.added
              ? 'bg-green-50 text-green-800'
              : part.removed
              ? 'bg-red-50 text-red-800'
              : 'bg-white text-gray-800';

          const prefix = part.added ? '+' : part.removed ? '-' : ' ';

          return (
            <pre
              key={idx}
              className={`px-4 py-1 whitespace-pre-wrap ${bg}`}
            >
              {!splitView && (
                <span className="mr-2 select-none opacity-60">
                  {prefix}
                </span>
              )}
              {part.value}
            </pre>
          );
        })}
      </div>

      <div className="mt-4 flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-green-200 rounded" />
          Added
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-red-200 rounded" />
          Removed
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-gray-200 rounded" />
          Unchanged
        </span>
      </div>
    </div>
  );
}
