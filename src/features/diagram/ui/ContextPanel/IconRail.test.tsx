import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { IconRail } from './IconRail';
import userEvent from '@testing-library/user-event';

describe('IconRail', () => {
    it('renders expand button', () => {
        const mockOnExpand = vi.fn();
        render(<IconRail onExpand={mockOnExpand} />);
        
        expect(screen.getByTitle('Expand panel')).toBeInTheDocument();
        expect(screen.getByLabelText('Expand context panel')).toBeInTheDocument();
    });

    it('calls onExpand when expand button is clicked', async () => {
        const user = userEvent.setup();
        const mockOnExpand = vi.fn();
        render(<IconRail onExpand={mockOnExpand} />);
        
        const expandButton = screen.getByTitle('Expand panel');
        await user.click(expandButton);
        
        expect(mockOnExpand).toHaveBeenCalledTimes(1);
    });

    it('renders icon indicators', () => {
        const mockOnExpand = vi.fn();
        render(<IconRail onExpand={mockOnExpand} />);
        
        expect(screen.getByLabelText('Filters')).toBeInTheDocument();
        expect(screen.getByLabelText('Details')).toBeInTheDocument();
    });
});
