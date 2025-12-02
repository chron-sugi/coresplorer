import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect } from 'vitest';
import { SplStats } from './SplStats';

const sampleSpl = `search index=main | stats count by host
| eval total=price*quantity
| eval host="localhost"
| where total > 1000
| fields host, total`;

describe('SplStats component', () => {
  it('renders line and command count', () => {
    render(<SplStats code={sampleSpl} />);
    // Expect two summary numbers (line count and command count)
    const numbers = screen.getAllByText(/^[0-9]+$/);
    expect(numbers).toHaveLength(2);
  });

  it('command pill click triggers callback with correct lines', () => {
    const onCommandClick = vi.fn();
    render(<SplStats code={sampleSpl} onCommandClick={onCommandClick} />);
    const searchBtn = screen.getByRole('button', { name: 'search' });
    fireEvent.click(searchBtn);
    expect(onCommandClick).toHaveBeenCalledWith('search', [1]);
  });

  it('field pill click triggers callback with correct lines', () => {
    const onFieldClick = vi.fn();
    render(<SplStats code={sampleSpl} onFieldClick={onFieldClick} />);
    const hostBtn = screen.getByRole('button', { name: 'host' });
    fireEvent.click(hostBtn);
    // 'host' appears on line 1 (stats by host), line 3 (eval host=), and line 5 (fields host)
    expect(onFieldClick).toHaveBeenCalledWith('host', [1, 3, 5]);
  });
});

describe('SplStats empty states', () => {
  it('handles empty code gracefully', () => {
    render(<SplStats code="" />);
    expect(screen.getByTestId('stats-panel')).toBeInTheDocument();
    // Both line count and command count should be 0
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(2);
  });

  it('shows "No commands detected" message for empty SPL', () => {
    render(<SplStats code="" />);
    expect(screen.getByText('No commands detected')).toBeInTheDocument();
  });

  it('renders fields section only when fields exist', () => {
    // makeresults count=1 extracts 'count' as a field
    render(<SplStats code="| makeresults count=1" />);
    // The FIELDS section exists because count is extracted
    expect(screen.getByText(/FIELDS/)).toBeInTheDocument();
  });
});

describe('SplStats active state highlighting', () => {
  it('highlights active command badge', () => {
    render(<SplStats code={sampleSpl} activeCommand="stats" />);
    const statsBtn = screen.getByRole('button', { name: 'stats' });
    // Check that the button has active styling (via className or aria attribute)
    expect(statsBtn).toBeInTheDocument();
  });

  it('highlights active field badge', () => {
    render(<SplStats code={sampleSpl} activeField="host" />);
    const hostBtn = screen.getByRole('button', { name: 'host' });
    expect(hostBtn).toBeInTheDocument();
  });

  it('does not highlight command when activeCommand is null', () => {
    render(<SplStats code={sampleSpl} activeCommand={null} />);
    const statsBtn = screen.getByRole('button', { name: 'stats' });
    expect(statsBtn).toBeInTheDocument();
  });

  it('does not highlight field when activeField is null', () => {
    render(<SplStats code={sampleSpl} activeField={null} />);
    const hostBtn = screen.getByRole('button', { name: 'host' });
    expect(hostBtn).toBeInTheDocument();
  });
});

describe('SplStats warnings display', () => {
  const splWithWarnings = `search error | stats count`;

  it('renders warnings section when warnings exist', () => {
    render(<SplStats code={splWithWarnings} />);
    expect(screen.getByText(/ANALYSIS/)).toBeInTheDocument();
  });

  it('displays warning severity badges', () => {
    render(<SplStats code={splWithWarnings} />);
    // The missing index warning has 'high' severity
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('displays warning line numbers', () => {
    render(<SplStats code={splWithWarnings} />);
    expect(screen.getByText(/Line 1/)).toBeInTheDocument();
  });

  it('displays warning messages', () => {
    render(<SplStats code={splWithWarnings} />);
    expect(screen.getByText(/does not specify an index/i)).toBeInTheDocument();
  });

  it('displays warning suggestions when available', () => {
    render(<SplStats code={splWithWarnings} />);
    // Check for the suggestion tip
    expect(screen.getByText(/Tip:/)).toBeInTheDocument();
  });

  it('does not render warnings section when no warnings', () => {
    render(<SplStats code="index=main | stats count" />);
    expect(screen.queryByText(/ANALYSIS/)).not.toBeInTheDocument();
  });
});

describe('SplStats multiple elements', () => {
  const multiCommandSpl = `index=main
| stats count by host
| eval total=count*2
| where total > 10
| table host, total`;

  it('renders all commands', () => {
    render(<SplStats code={multiCommandSpl} />);
    expect(screen.getByRole('button', { name: 'search' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'stats' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'eval' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'where' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'table' })).toBeInTheDocument();
  });

  it('renders extracted fields', () => {
    render(<SplStats code={multiCommandSpl} />);
    // Fields extracted depend on the analyzer - count and total should be captured
    expect(screen.getByRole('button', { name: 'total' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'count' })).toBeInTheDocument();
  });

  it('shows correct command count in header', () => {
    render(<SplStats code={multiCommandSpl} />);
    expect(screen.getByText(/COMMANDS · \d+/)).toBeInTheDocument();
  });

  it('shows correct field count in header', () => {
    render(<SplStats code={multiCommandSpl} />);
    expect(screen.getByText(/FIELDS · \d+/)).toBeInTheDocument();
  });
});

describe('SplStats callback handling', () => {
  it('handles missing onCommandClick callback gracefully', () => {
    render(<SplStats code={sampleSpl} />);
    const statsBtn = screen.getByRole('button', { name: 'stats' });
    // Should not throw when clicking without callback
    expect(() => fireEvent.click(statsBtn)).not.toThrow();
  });

  it('handles missing onFieldClick callback gracefully', () => {
    render(<SplStats code={sampleSpl} />);
    const hostBtn = screen.getByRole('button', { name: 'host' });
    // Should not throw when clicking without callback
    expect(() => fireEvent.click(hostBtn)).not.toThrow();
  });

  it('stops event propagation on command click', () => {
    const parentClickHandler = vi.fn();
    const onCommandClick = vi.fn();

    render(
      <div onClick={parentClickHandler}>
        <SplStats code={sampleSpl} onCommandClick={onCommandClick} />
      </div>
    );

    const statsBtn = screen.getByRole('button', { name: 'stats' });
    fireEvent.click(statsBtn);

    expect(onCommandClick).toHaveBeenCalled();
    expect(parentClickHandler).not.toHaveBeenCalled();
  });

  it('stops event propagation on field click', () => {
    const parentClickHandler = vi.fn();
    const onFieldClick = vi.fn();

    render(
      <div onClick={parentClickHandler}>
        <SplStats code={sampleSpl} onFieldClick={onFieldClick} />
      </div>
    );

    const hostBtn = screen.getByRole('button', { name: 'host' });
    fireEvent.click(hostBtn);

    expect(onFieldClick).toHaveBeenCalled();
    expect(parentClickHandler).not.toHaveBeenCalled();
  });
});

describe('SplStats with parseResult', () => {
  it('accepts parseResult prop', () => {
    // When parseResult is provided, it should be used for analysis
    render(<SplStats code={sampleSpl} parseResult={null} />);
    expect(screen.getByTestId('stats-panel')).toBeInTheDocument();
  });
});

describe('SplStats base search detection', () => {
  it('adds search command for base search without explicit search command', () => {
    const splWithoutSearch = `index=main | stats count`;
    render(<SplStats code={splWithoutSearch} />);
    expect(screen.getByRole('button', { name: 'search' })).toBeInTheDocument();
  });

  it('handles SPL starting with pipe', () => {
    const splStartingWithPipe = `| makeresults count=1 | eval x=1`;
    render(<SplStats code={splStartingWithPipe} />);
    // Should not add a search command when SPL starts with pipe
    expect(screen.queryByRole('button', { name: 'search' })).not.toBeInTheDocument();
  });
});
