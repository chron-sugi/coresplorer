import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { SearchCommand } from './SearchCommand';
import { useDiagramStore } from '../../model/store/diagram.store';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

(Element.prototype as any).scrollIntoView = vi.fn();

vi.mock('../../api/diagram.queries', () => ({
  useDiagramGraphQuery: () => ({
    data: {
      nodes: [
        { id: 'node-1', label: 'Node 1', type: 'saved_search' },
        { id: 'node-2', label: 'Node 2', type: 'index' },
      ],
    },
  }),
}));

describe('SearchCommand', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverMock as unknown as typeof ResizeObserver);
    useDiagramStore.getState().reset();
  });

  afterEach(() => {
    useDiagramStore.getState().reset();
    vi.unstubAllGlobals();
  });

  it('opens the command palette with keyboard shortcut', () => {
    render(<SearchCommand />);

    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

    expect(screen.getByText('Node 1')).toBeInTheDocument();
    expect(screen.getByText('Node 2')).toBeInTheDocument();
  });

  it('sets coreId and closes when selecting a result', async () => {
    render(<SearchCommand />);

    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    fireEvent.click(screen.getByText('Node 1'));

    await waitFor(() => expect(screen.queryByText('Node 1')).not.toBeInTheDocument());
    expect(useDiagramStore.getState().coreId).toBe('node-1');
  });

  it('opens via the trigger button', () => {
    render(<SearchCommand />);

    fireEvent.click(screen.getByText('Search objects...'));
    expect(screen.getByText('Node 1')).toBeInTheDocument();
  });
});
