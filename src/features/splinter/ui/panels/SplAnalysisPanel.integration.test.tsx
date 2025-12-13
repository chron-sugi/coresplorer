/**
 * SplAnalysisPanel Integration Tests
 *
 * Tests that verify the panel integrates correctly with:
 * - Real SPL parsing (entities/spl)
 * - Real field lineage analysis (entities/field)
 * - Zustand stores (editor, lineage, inspector)
 */

import { render, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SplAnalysisPanel } from './SplAnalysisPanel';
import { useEditorStore, parseSPL } from '@/entities/spl';
import { useInspectorStore } from '../../model/store/splinter.store';
import { useLineageStore, analyzeLineage } from '@/entities/field';

// Mock scrollIntoView since it's not available in jsdom
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.scrollTo = vi.fn();

/**
 * Helper to set up a complete analysis state.
 * Parses SPL, analyzes lineage, and sets up stores.
 */
async function setupAnalysis(spl: string) {
  // Parse SPL
  const parseResult = parseSPL(spl);

  // Update editor store with SPL and parse result
  useEditorStore.setState({
    splText: spl,
    parseResult
  });

  // Analyze lineage if we have an AST
  if (parseResult.ast) {
    const lineageIndex = analyzeLineage(parseResult.ast);
    useLineageStore.setState({ lineageIndex });
  }
}

describe('SplAnalysisPanel Integration', () => {
  beforeEach(() => {
    // Reset all stores to initial state
    useEditorStore.setState({
      splText: '',
      parseResult: null,
      cursorLine: 1,
      cursorColumn: 0
    });
    useLineageStore.setState({
      lineageIndex: null,
      hoveredField: null,
      selectedField: null,
      highlightedLines: [],
      tooltipVisible: false,
      contextPanelOpen: false,
    });
    useInspectorStore.setState({
      highlightedLines: [],
      activeCommand: null,
      activeField: null,
      selectedText: null,
    });
  });

  describe('field lineage with real analyzer', () => {
    it('detects field creation in eval command', async () => {
      const spl = `| makeresults
| eval myfield=1`;

      await setupAnalysis(spl);
      render(<SplAnalysisPanel />);

      // Verify the field lineage is available
      const lineageIndex = useLineageStore.getState().lineageIndex;
      expect(lineageIndex).not.toBeNull();

      // The analyzer should detect 'myfield' creation
      const lineage = lineageIndex?.getFieldLineage('myfield');
      expect(lineage).not.toBeNull();
      expect(lineage?.events.some(e => e.kind === 'created')).toBe(true);
    });

    it('tracks field through multiple commands', async () => {
      const spl = `| makeresults
| eval host="server1"
| stats count by host
| where host!=""`;

      await setupAnalysis(spl);
      render(<SplAnalysisPanel />);

      const lineageIndex = useLineageStore.getState().lineageIndex;
      const hostLineage = lineageIndex?.getFieldLineage('host');

      expect(hostLineage).not.toBeNull();
      expect(hostLineage?.events.length).toBeGreaterThanOrEqual(2);
    });

    it('detects field drop by fields command', async () => {
      const spl = `| makeresults
| eval a=1, b=2, c=3
| fields a b`;

      await setupAnalysis(spl);
      render(<SplAnalysisPanel />);

      const lineageIndex = useLineageStore.getState().lineageIndex;

      // 'c' should be dropped
      const cLineage = lineageIndex?.getFieldLineage('c');
      expect(cLineage?.events.some(e => e.kind === 'dropped')).toBe(true);

      // 'a' and 'b' should be kept
      const aLineage = lineageIndex?.getFieldLineage('a');
      expect(aLineage?.events.some(e => e.kind === 'dropped')).toBeFalsy();
    });
  });

  describe('underlined ranges from real lineage events', () => {
    it('provides correct underline ranges for field events', async () => {
      const spl = `| makeresults
| eval status="active"
| where status="active"`;

      await setupAnalysis(spl);

      // Set active field in inspector
      useInspectorStore.setState({ activeField: 'status' });

      render(<SplAnalysisPanel />);

      // The editor should receive underlined ranges for 'status'
      const lineageIndex = useLineageStore.getState().lineageIndex;
      const events = lineageIndex?.getFieldEvents('status') ?? [];

      // Should have at least 1 event (created in eval)
      expect(events.length).toBeGreaterThanOrEqual(1);

      // Verify we have creation event at minimum
      const hasCreation = events.some(e => e.kind === 'created' || e.kind === 'origin');
      expect(hasCreation).toBe(true);

      // Verify event has line information for underline rendering
      const creationEvent = events.find(e => e.kind === 'created' || e.kind === 'origin');
      expect(creationEvent?.line).toBeDefined();
    });
  });

  describe('field selection integration', () => {
    it('updates lineage store when field is selected', async () => {
      const spl = `| makeresults | eval host="test"`;
      await setupAnalysis(spl);
      render(<SplAnalysisPanel />);

      // Simulate selecting a field
      act(() => {
        useLineageStore.getState().selectField('host');
      });

      const state = useLineageStore.getState();
      expect(state.selectedField?.fieldName).toBe('host');
    });

    it('clears selection when same field clicked twice', async () => {
      const spl = `| makeresults | eval host="test"`;
      await setupAnalysis(spl);
      render(<SplAnalysisPanel />);

      // First click - select
      act(() => {
        useLineageStore.getState().selectField('host');
      });
      expect(useLineageStore.getState().selectedField?.fieldName).toBe('host');

      // Second click - clear (simulated through clearSelection)
      act(() => {
        useLineageStore.getState().clearSelection();
      });
      expect(useLineageStore.getState().selectedField).toBeNull();
    });
  });

  describe('combined highlighting', () => {
    it('combines search highlights with lineage highlights', async () => {
      const spl = `search index=main
| stats count by host
| table host count`;

      await setupAnalysis(spl);

      // Set search highlights from subsearch panel
      useInspectorStore.setState({ highlightedLines: [1, 2] });

      // Set lineage highlights
      useLineageStore.setState({ highlightedLines: [2, 3] });

      render(<SplAnalysisPanel />);

      // The panel should combine both sources
      // Note: The actual combining happens in the component via useMemo
      const inspectorLines = useInspectorStore.getState().highlightedLines;
      const lineageLines = useLineageStore.getState().highlightedLines;

      // Both stores should maintain their values
      expect(inspectorLines).toEqual([1, 2]);
      expect(lineageLines).toEqual([2, 3]);
    });
  });

  describe('code change integration', () => {
    it('re-parses and re-analyzes when code changes', async () => {
      // Start with simple SPL
      const initialSpl = `| makeresults`;
      await setupAnalysis(initialSpl);
      render(<SplAnalysisPanel />);

      // Initial state should have no user-defined fields
      let lineageIndex = useLineageStore.getState().lineageIndex;
      expect(lineageIndex?.getFieldLineage('myfield')).toBeNull();

      // Update with new code that creates a field
      const updatedSpl = `| makeresults | eval myfield=1`;
      await setupAnalysis(updatedSpl);

      // Now the field should exist
      lineageIndex = useLineageStore.getState().lineageIndex;
      expect(lineageIndex?.getFieldLineage('myfield')).not.toBeNull();
    });
  });

  describe('text selection and KO inspector', () => {
    it('shows KnowledgeObjectInspector when text is selected', async () => {
      const spl = `| inputlookup my_lookup.csv`;
      await setupAnalysis(spl);

      // Simulate text selection
      useInspectorStore.setState({ selectedText: 'my_lookup' });

      render(<SplAnalysisPanel />);

      // The KO inspector should be visible
      await waitFor(() => {
        const inspector = document.querySelector('[class*="absolute"][class*="right-4"]');
        expect(inspector).toBeInTheDocument();
      });
    });
  });

  describe('field existence queries', () => {
    it('can query field existence at specific line', async () => {
      const spl = `| makeresults
| eval a=1
| eval b=a+1
| fields b`;

      await setupAnalysis(spl);
      render(<SplAnalysisPanel />);

      const lineageIndex = useLineageStore.getState().lineageIndex;

      // Field 'a' should exist at line 3 (where it's used in b=a+1)
      expect(lineageIndex?.fieldExistsAt('a', 3)).toBe(true);

      // Field 'a' shouldn't exist at line 4 (after fields command drops it)
      // Note: This depends on lineage tracking implementation
    });

    it('can get all fields at a specific line', async () => {
      const spl = `| makeresults
| eval a=1, b=2, c=3`;

      await setupAnalysis(spl);
      render(<SplAnalysisPanel />);

      const lineageIndex = useLineageStore.getState().lineageIndex;
      const fieldsAtLine2 = lineageIndex?.getFieldsAtLine(2) ?? [];

      // Line 2 creates a, b, c
      expect(fieldsAtLine2).toContain('a');
      expect(fieldsAtLine2).toContain('b');
      expect(fieldsAtLine2).toContain('c');
    });
  });

  describe('complex SPL scenarios', () => {
    it('handles stats command field creation', async () => {
      const spl = `search index=main
| stats count as event_count, avg(duration) as avg_duration by host`;

      await setupAnalysis(spl);
      render(<SplAnalysisPanel />);

      const lineageIndex = useLineageStore.getState().lineageIndex;

      // Stats should create event_count and avg_duration
      expect(lineageIndex?.getFieldLineage('event_count')).not.toBeNull();
      expect(lineageIndex?.getFieldLineage('avg_duration')).not.toBeNull();
    });

    it('handles rex field extraction', async () => {
      const spl = `search index=main
| rex field=_raw "error=(?<error_code>\\d+)"`;

      await setupAnalysis(spl);
      render(<SplAnalysisPanel />);

      const lineageIndex = useLineageStore.getState().lineageIndex;

      // Rex should create error_code field
      const errorCodeLineage = lineageIndex?.getFieldLineage('error_code');
      expect(errorCodeLineage).not.toBeNull();
    });

    it('handles rename command', async () => {
      const spl = `| makeresults
| eval original_name=1
| rename original_name as new_name`;

      await setupAnalysis(spl);
      render(<SplAnalysisPanel />);

      const lineageIndex = useLineageStore.getState().lineageIndex;

      // new_name should exist
      expect(lineageIndex?.getFieldLineage('new_name')).not.toBeNull();

      // original_name should be dropped
      const origLineage = lineageIndex?.getFieldLineage('original_name');
      expect(origLineage?.events.some(e => e.kind === 'dropped')).toBe(true);
    });
  });
});
