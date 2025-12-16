/**
 * SPLinter Page
 *
 * Top-level SPLinter UI page. Provides the left context panel (stats, structure,
 * linter, schema) and the SPL editor area. Handles in-query searching and
 * highlights for the editor tools.
 *
 * Route: /splinter
 *
 * @module pages/splinter/SPLinterPage
 */

import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from '@/widgets/layout';
import { SearchCommand } from '@/widgets/header';
import { useNodeDetailsQuery } from '@/entities/snapshot';
import { useEditorStore } from '@/entities/spl';
import {

  SplStatsPanel,
  SubsearchPanel,
  SplAnalysisPanel,
  useInspectorStore,
  useSPLinterPage,
  tabVariants,
  editorContainerVariants,
  searchInputVariants,
  searchSuggestionVariants,
  dropdownVariants,
} from '@/features/splinter';
import { ContextPanel } from '@/shared/ui';
import { Search, Layers, X, MousePointerClick } from 'lucide-react';
import { useHighlight, HighlightLegend } from '@/features/field-highlight';

/**
 * SPLinter page component
 *
 * Advanced SPL analysis tool with code editor, structure visualization,
 * performance linting, and schema mocking capabilities.
 *
 * @returns Rendered SPLinter page
 */
export function SPLinterPage(): React.JSX.Element {
  const { clearSelection: clearInspectorSelection } = useInspectorStore();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const { setSplText } = useEditorStore();

  // Check for loadNodeId from navigation state (e.g., from search command)
  const { loadNodeId } = (location.state as { loadNodeId?: string }) || {};

  // Fetch node details if loadNodeId is provided
  const { data: nodeDetails } = useNodeDetailsQuery(loadNodeId ?? null);
  const { setSelectedKnowledgeObjectId } = useInspectorStore();

  // Load SPL code into editor when node details are fetched
  useEffect(() => {
    if (nodeDetails?.spl_code) {
      setSplText(nodeDetails.spl_code);
      // Set the knowledge object ID if we loaded via search/navigation
      if (loadNodeId) {
        setSelectedKnowledgeObjectId(loadNodeId);
      }
      // Clear location state to prevent reloading on subsequent renders
      window.history.replaceState({}, document.title);
    }
  }, [nodeDetails, setSplText, loadNodeId, setSelectedKnowledgeObjectId]);

  // Field highlight state
  const {
    selectedField,
    isLocked,
    clearSelection,
    toggleLock
  } = useHighlight();

  const {
    activeTab,
    setActiveTab,
    isCollapsed,
    toggleCollapsed,
    searchTerm,
    setSearchTerm,
    showSuggestions,
    setShowSuggestions,
    searchResults,
    handleResultClick,
  } = useSPLinterPage();

  const tabButtons = (
    <div className="flex border-b border-slate-800">
      <button
        onClick={() => setActiveTab('stats')}
        className={tabVariants({ state: activeTab === 'stats' ? 'active' : 'inactive' })}
        title="Statistics"
      >
        <Search className="w-4 h-4" />
      </button>
      <button
        onClick={() => setActiveTab('structure')}
        className={tabVariants({ state: activeTab === 'structure' ? 'active' : 'inactive' })}
        title="Structure"
      >
        <Layers className="w-4 h-4" />
      </button>
    </div>
  );

  const leftPanel = (
    <ContextPanel
      title="SPLinter"
      subtitle="Advanced SPL Analysis"
      side="left"
      isCollapsed={isCollapsed}
      onToggleCollapse={toggleCollapsed}
      headerContent={tabButtons}
    >
      {activeTab === 'stats' && <SplStatsPanel />}
      {activeTab === 'structure' && <SubsearchPanel />}
    </ContextPanel>
  );

  return (
    <Layout leftPanel={leftPanel} searchComponent={<SearchCommand />}>
      <div
        role="button"
        aria-label=""
        data-testid="splinter-editor-container"
        tabIndex={0}
        className={editorContainerVariants()}
        onClick={() => {
            // Only clear if not locked
            if (!isLocked) {
                clearSelection();
                clearInspectorSelection();
            }
        }}
        onKeyDown={(e) => { 
            if (e.key === 'Escape') {
                clearSelection();
                clearInspectorSelection();
            }
        }}
      >
        {/* Header: Query Text OR Field Legend */}
        <div
          className="px-4 py-3 border-b border-slate-700 bg-slate-900 flex flex-col gap-3"
          onClick={(e) => e.stopPropagation()}
        >
            {/* Top Row: Label or Legend */}
            <div className="min-h-[24px] flex items-center">
                {selectedField ? (
                    <HighlightLegend
                        fieldName={selectedField}
                        isLocked={isLocked}
                        onClear={clearSelection}
                        onToggleLock={toggleLock}
                        variant="bar"
                        className="w-full"
                    />
                ) : (
                    <div className="flex items-center gap-2 text-slate-500">
                        <MousePointerClick className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Select a field to view lineage</span>
                    </div>
                )}
            </div>

            {/* Search Bar - Always Visible */}
            <div className="relative w-full">
                {/* Icon positioned at left-3, coordinated with input pl-9 (left-3 + icon width + spacing) */}
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                    type="text"
                    placeholder="Search in query..."
                    className={searchInputVariants()}
                    value={searchTerm}
                    ref={searchInputRef}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                />
                {searchTerm && (
                    <button
                        type="button"
                        onClick={() => {
                            setSearchTerm('');
                            setShowSuggestions(false);
                            const input = searchInputRef.current;
                            if (input) {
                                input.value = '';
                                input.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                        }}
                        data-testid="search-clear-button"
                        className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-800 transition-colors"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}

                {/* Suggestions Dropdown */}
                {showSuggestions && searchResults.length > 0 && (
                    <div className={dropdownVariants()}>
                        {searchResults.map((result, idx) => (
                            // group class enables child group-hover: utilities
                            <button
                                key={`${result.line}-${idx}`}
                                className={searchSuggestionVariants()}
                                onClick={() => handleResultClick(result)}
                            >
                                {/* Controlled by parent group */}
                                <span className="font-mono text-slate-500 group-hover:text-blue-500 w-6 text-right shrink-0">{result.line}</span>
                                <span className="text-slate-300 truncate font-mono">{result.content}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Code Viewer */}
        <div className="flex-1 overflow-auto">
          <SplAnalysisPanel />
        </div>
      </div>
    </Layout>
  );
}
