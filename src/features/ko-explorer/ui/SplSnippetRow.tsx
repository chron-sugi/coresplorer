import { useMemo } from 'react';
import { escapeRegex } from '@/shared/lib';

interface SplSnippetRowProps {
  snippet: string;
  searchTerm: string;
}

/**
 * Renders an inline preview of matching SPL code with the search term highlighted.
 */
export function SplSnippetRow({ snippet, searchTerm }: SplSnippetRowProps): React.JSX.Element {
  const segments = useMemo(() => {
    if (!searchTerm) return [{ text: snippet, highlight: false }];

    const escaped = escapeRegex(searchTerm);
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = snippet.split(regex);

    return parts
      .filter(Boolean)
      .map((part) => ({
        text: part,
        highlight: part.toLowerCase() === searchTerm.toLowerCase(),
      }));
  }, [snippet, searchTerm]);

  return (
    <div className="col-span-6 px-4 pt-2 pb-2">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">
          SPL match
        </span>
        <code className="text-xs font-mono text-muted-foreground truncate">
          {segments.map((seg, i) =>
            seg.highlight ? (
              <mark
                key={i}
                className="bg-amber-500/20 text-amber-400 rounded-sm px-0.5"
              >
                {seg.text}
              </mark>
            ) : (
              <span key={i}>{seg.text}</span>
            )
          )}
        </code>
      </div>
    </div>
  );
}
