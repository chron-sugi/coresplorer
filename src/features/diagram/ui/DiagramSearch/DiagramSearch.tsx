/**
 * Diagram quick-search component
 *
 * Provides a small search UI for jumping to nodes on the diagram. Uses
 * the `useDiagramSearch` hook for suggestion generation and keyboard
 * activation.
 */
import { useEffect, useRef, useState } from 'react';
import type { DiagramSearchProps } from './DiagramSearch.types';
import { Search, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { KEYBOARD_SHORTCUTS } from '../../model/constants/diagram.keyboard.constants';

/**
 * Search component for the diagram feature.
 * Provides an input field with autocomplete suggestions for finding nodes in the diagram.
 */
export const DiagramSearch = ({
  isOpen,
  query,
  suggestions,
  onChangeQuery,
  onOpen,
  onClose,
  onSelectSuggestion,
}: DiagramSearchProps): React.JSX.Element | null => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset highlighted index when suggestions change
  useEffect(() => {
    setHighlightedIndex(suggestions.length > 0 ? 0 : -1);
  }, [suggestions]);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="absolute top-4 right-4 z-50 p-2 bg-card rounded-md shadow-md border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        title="Search diagram (Ctrl+K)"
      >
        <Search size={20} />
      </button>
    );
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === KEYBOARD_SHORTCUTS.CLOSE.KEY) {
      onClose();
      return;
    }

    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        onSelectSuggestion(suggestions[highlightedIndex].id);
      }
    }
  };

  const handleSuggestionClick = (id: string) => {
    onSelectSuggestion(id);
  };

  return (
    <div className="absolute top-4 right-4 z-50 bg-card rounded-md shadow-lg border border-border animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center p-1 border-b border-border">
        <div className="flex items-center px-2 text-muted-foreground">
          <Search size={16} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onChangeQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Find by name or SPL..."
          className="bg-transparent border-none focus:ring-0 text-sm text-foreground placeholder-muted-foreground w-64 h-8"
        />
        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-accent rounded text-muted-foreground ml-1"
          title="Close (Esc)"
        >
          <X size={16} />
        </button>
      </div>

      {/* Suggestions dropdown - show all nodes when empty, filtered when typing */}
      <div className="max-h-64 overflow-y-auto">
          {suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((suggestion, index) => (
                <li
                  key={suggestion.id}
                  role="option"
                  aria-selected={index === highlightedIndex}
                  tabIndex={0}
                  className={cn(
                    "px-3 py-2 cursor-pointer transition-colors",
                    index === highlightedIndex
                      ? "bg-accent"
                      : "hover:bg-accent/50"
                  )}
                  onClick={() => handleSuggestionClick(suggestion.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSuggestionClick(suggestion.id); }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {suggestion.label}
                    </span>
                    {suggestion.type && (
                      <span className="text-xs text-muted-foreground">
                        {suggestion.type}
                      </span>
                    )}
                    {suggestion.matchedInSpl && (
                      <span className="text-xs text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                        SPL match
                      </span>
                    )}
                  </div>
                  {suggestion.app && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      App: {suggestion.app}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
              No results
            </div>
          )}
      </div>
    </div>
  );
};
