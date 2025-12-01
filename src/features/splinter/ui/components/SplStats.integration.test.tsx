import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SplStats } from './SplStats';

// We are NOT mocking analyzeSpl. We want to test the integration between the UI and the domain logic.
// import { analyzeSpl } from '../../lib/spl/analyzeSpl'; 

describe('SplStats Integration', () => {
    const sampleSpl = `search index=main status=500 
| stats count by host 
| eval is_error=if(status >= 500, "yes", "no")`;

    it('calculates and displays stats using real domain logic', () => {
        render(<SplStats code={sampleSpl} />);

        // Check Line Count (3 lines) and Command Count (3 commands)
        // Both are "3", so we expect 2 elements with text "3"
        const threes = screen.getAllByText('3');
        expect(threes).toHaveLength(2);
        
        expect(screen.getByText('Lines')).toBeInTheDocument();
        expect(screen.getByText('Commands')).toBeInTheDocument();

        // Check Unique Commands
        expect(screen.getByText('search')).toBeInTheDocument();
        expect(screen.getByText('stats')).toBeInTheDocument();
        expect(screen.getByText('eval')).toBeInTheDocument();

        // Check Fields
        expect(screen.getByText('index')).toBeInTheDocument();
        expect(screen.getByText('status')).toBeInTheDocument();
        expect(screen.getByText('is_error')).toBeInTheDocument();
    });

    it('triggers onCommandClick with correct line numbers when a command is clicked', () => {
        const handleCommandClick = vi.fn();
        render(<SplStats code={sampleSpl} onCommandClick={handleCommandClick} />);

        // Click on 'stats' command
        const statsButton = screen.getByText('stats');
        fireEvent.click(statsButton);

        // 'stats' is on line 2
        expect(handleCommandClick).toHaveBeenCalledWith('stats', [2]);
    });

    it('triggers onFieldClick with correct line numbers when a field is clicked', () => {
        const handleFieldClick = vi.fn();
        render(<SplStats code={sampleSpl} onFieldClick={handleFieldClick} />);

        // Click on 'status' field
        // 'status' appears on line 1 (status=500) and line 3 (if(status >= 500...))
        // Wait, analyzeSpl regex for fields is `\b([a-z_][a-z0-9_]*)\s*=`
        // So it only catches assignments.
        // Line 1: status=500 -> match
        // Line 3: status >= 500 -> NOT an assignment (comparison)
        // Let's verify the domain logic behavior via this test.
        
        const statusButton = screen.getByText('status');
        fireEvent.click(statusButton);

        expect(handleFieldClick).toHaveBeenCalledWith('status', [1]);
    });

    it('highlights the active command', () => {
        render(<SplStats code={sampleSpl} activeCommand="stats" />);

        const statsButton = screen.getByText('stats');
        // Check for the active class/style (bg-sky-600)
        expect(statsButton).toHaveClass('bg-sky-600');
        
        const searchButton = screen.getByText('search');
        expect(searchButton).not.toHaveClass('bg-sky-600');
    });
});
