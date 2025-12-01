/**
 * useSPLinterPage Hook
 *
 * Encapsulates SPLinter page UI state, derived data, and handlers.
 * Keeps page component focused on composition per FSD.
 *
 * @module features/splinter/model/useSPLinterPage
 */
import { useEffect, useMemo, useState } from 'react';
import { useInspectorStore } from './store/splinter.store';
import { searchSpl, type SearchResult } from '../lib/spl/searchSpl';
import { useEditorStore, selectSplText, selectParseResult } from '@/entities/spl';

export type SPLinterTab = 'stats' | 'structure' | 'linter' | 'schema';

type SearchFilters = { commands: boolean; fields: boolean; text: boolean };

export type UseSPLinterPageReturn = {
  activeTab: SPLinterTab;
  setActiveTab: (tab: SPLinterTab) => void;
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  searchResults: SearchResult[];
  highlightedLinesList: number[];
  handleResultClick: (result: SearchResult) => void;
  filters: SearchFilters;
  toggleFilter: (key: keyof SearchFilters) => void;
};

export function useSPLinterPage(): UseSPLinterPageReturn {
  const [activeTab, setActiveTab] = useState<SPLinterTab>('stats');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({ commands: true, fields: true, text: true });

  const code = useEditorStore(selectSplText);
  const parseResult = useEditorStore(selectParseResult);
  const { setHighlightedLines } = useInspectorStore();

  const { searchResults, highlightedLinesList } = useMemo(() => {
    if (!searchTerm) {
      return { searchResults: [], highlightedLinesList: [] };
    }
    const results = searchSpl(code, searchTerm, parseResult, filters);
    return { searchResults: results, highlightedLinesList: results.map((r) => r.line) };
  }, [code, parseResult, searchTerm, filters]);

  useEffect(() => {
    setHighlightedLines(highlightedLinesList);
  }, [highlightedLinesList, setHighlightedLines]);

  const handleResultClick = (result: SearchResult) => {
    setHighlightedLines([result.line]);
    setShowSuggestions(false);
  };

  return {
    activeTab,
    setActiveTab,
    isCollapsed,
    toggleCollapsed: () => setIsCollapsed((v) => !v),
    searchTerm,
    setSearchTerm,
    showSuggestions,
    setShowSuggestions,
    searchResults,
    highlightedLinesList,
    handleResultClick,
    filters,
    toggleFilter: (key) => setFilters((prev) => ({ ...prev, [key]: !prev[key] })),
  };
}
