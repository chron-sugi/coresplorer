import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SplTab } from './SplTab';

// Mock the shared components
vi.mock('../SplCodeBlock', () => ({
    SplCodeBlock: ({ code }: { code: string }) => <div data-testid="spl-code-block">{code}</div>,
}));

vi.mock('../SplExpandedView', () => ({
    SplExpandedView: () => <div data-testid="spl-expanded-view" />,
}));

describe('SplTab', () => {
    it('renders SPL code', () => {
        const code = 'search index=main | stats count';
        render(<SplTab code={code} nodeName="Test Node" />);
        
        expect(screen.getByTestId('spl-code-block')).toHaveTextContent(code);
    });

    it('handles empty code gracefully', () => {
        render(<SplTab code="" nodeName="Empty Node" />);
        
        expect(screen.getByText('No SPL code available for this node')).toBeInTheDocument();
    });
});
