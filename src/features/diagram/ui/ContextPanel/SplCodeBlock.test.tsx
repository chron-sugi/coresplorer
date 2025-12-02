import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { SplCodeBlock } from './SplCodeBlock';

const originalClipboard = navigator.clipboard;

describe('SplCodeBlock', () => {
  afterEach(() => {
    Object.assign(navigator, { clipboard: originalClipboard });
    vi.restoreAllMocks();
  });

  it('copies code to clipboard and shows feedback', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<SplCodeBlock code="index=main" />);

    const copyButton = screen.getByTitle('Copy to clipboard');
    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(writeText).toHaveBeenCalledWith('index=main');
    await waitFor(() => expect(copyButton.querySelector('.lucide-check')).toBeInTheDocument());

    await waitFor(() => expect(copyButton.querySelector('.lucide-check')).not.toBeInTheDocument(), {
      timeout: 2500,
    });
  });

  it('logs an error when copy fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('copy failed'));
    Object.assign(navigator, { clipboard: { writeText } });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<SplCodeBlock code="index=main" />);

    await act(async () => {
      fireEvent.click(screen.getByTitle('Copy to clipboard'));
    });

    expect(writeText).toHaveBeenCalled();
    await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
    expect(screen.getByTitle('Copy to clipboard').querySelector('.lucide-check')).not.toBeInTheDocument();
  });

  it('renders expand button and calls callback', () => {
    const onExpand = vi.fn();
    render(<SplCodeBlock code="search" onExpand={onExpand} />);

    fireEvent.click(screen.getByText('Expand'));
    expect(onExpand).toHaveBeenCalled();
  });
});
