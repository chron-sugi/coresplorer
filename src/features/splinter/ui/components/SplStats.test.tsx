import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { SplStats } from './SplStats';

const sampleSpl = `search index=main | stats count by host
| eval total=price*quantity
| eval host="localhost"
| where total > 1000
| fields host, total`;

describe('SplStats component', () => {
  test('renders line and command count', () => {
    render(<SplStats code={sampleSpl} />);
    // Expect two summary numbers (line count and command count)
    const numbers = screen.getAllByText(/^[0-9]+$/);
    expect(numbers).toHaveLength(2);
  });

  test('command pill click triggers callback with correct lines', () => {
    const onCommandClick = vi.fn();
    render(<SplStats code={sampleSpl} onCommandClick={onCommandClick} />);
    const searchBtn = screen.getByRole('button', { name: 'search' });
    fireEvent.click(searchBtn);
    expect(onCommandClick).toHaveBeenCalledWith('search', [1]);
  });

  test('field pill click triggers callback with correct lines', () => {
    const onFieldClick = vi.fn();
    render(<SplStats code={sampleSpl} onFieldClick={onFieldClick} />);
    const hostBtn = screen.getByRole('button', { name: 'host' });
    fireEvent.click(hostBtn);
    expect(onFieldClick).toHaveBeenCalledWith('host', [3]);
  });
});
