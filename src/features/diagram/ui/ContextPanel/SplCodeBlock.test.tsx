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

  describe('Risky command warning dialog', () => {
    it('shows warning dialog when copying SPL with collect command', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      render(<SplCodeBlock code="index=main | stats count | collect index=summary" />);

      const copyButton = screen.getByTitle('Copy to clipboard');
      await act(async () => {
        fireEvent.click(copyButton);
      });

      // Dialog should be visible
      await waitFor(() => {
        expect(screen.getByText('Risky Commands Detected')).toBeInTheDocument();
      });

      // Should show collect command in dialog
      expect(screen.getByRole('dialog')).toHaveTextContent('collect');
    });

    it('shows warning dialog when copying SPL with outputlookup command', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      render(<SplCodeBlock code="index=main | stats count | outputlookup results.csv" />);

      const copyButton = screen.getByTitle('Copy to clipboard');
      await act(async () => {
        fireEvent.click(copyButton);
      });

      // Dialog should be visible
      await waitFor(() => {
        expect(screen.getByText('Risky Commands Detected')).toBeInTheDocument();
      });

      // Should show outputlookup command in dialog
      expect(screen.getByRole('dialog')).toHaveTextContent('outputlookup');
    });

    it('shows both command names when both collect and outputlookup are present', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      const code = `index=main
| collect index=summary
| outputlookup results.csv`;

      render(<SplCodeBlock code={code} />);

      const copyButton = screen.getByTitle('Copy to clipboard');
      await act(async () => {
        fireEvent.click(copyButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Risky Commands Detected')).toBeInTheDocument();
      });

      // Should show both commands in dialog
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveTextContent('collect');
      expect(dialog).toHaveTextContent('outputlookup');
    });

    it('"Keep and Copy" button copies original SPL', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      const code = 'index=main | stats count | collect index=summary';
      render(<SplCodeBlock code={code} />);

      const copyButton = screen.getByTitle('Copy to clipboard');
      await act(async () => {
        fireEvent.click(copyButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Keep and Copy')).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Keep and Copy'));
      });

      // Should copy original code unchanged
      expect(writeText).toHaveBeenCalledWith(code);

      // Dialog should close
      await waitFor(() => {
        expect(screen.queryByText('Risky Commands Detected')).not.toBeInTheDocument();
      });
    });

    it('"Remove and Copy" button copies SPL with risky commands removed', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      const code = 'index=main | stats count | collect index=summary';
      render(<SplCodeBlock code={code} />);

      const copyButton = screen.getByTitle('Copy to clipboard');
      await act(async () => {
        fireEvent.click(copyButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Remove and Copy')).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Remove and Copy'));
      });

      // Should copy code without collect command
      expect(writeText).toHaveBeenCalledWith('index=main | stats count');

      // Dialog should close
      await waitFor(() => {
        expect(screen.queryByText('Risky Commands Detected')).not.toBeInTheDocument();
      });
    });

    it('does not show dialog for clean SPL without risky commands', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      const code = 'index=main | stats count | sort -count';
      render(<SplCodeBlock code={code} />);

      const copyButton = screen.getByTitle('Copy to clipboard');
      await act(async () => {
        fireEvent.click(copyButton);
      });

      // Should copy immediately without showing dialog
      expect(writeText).toHaveBeenCalledWith(code);
      expect(screen.queryByText('Risky Commands Detected')).not.toBeInTheDocument();
    });
  });
});
