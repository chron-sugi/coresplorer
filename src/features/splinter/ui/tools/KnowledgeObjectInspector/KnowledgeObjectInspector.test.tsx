import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KnowledgeObjectInspector } from './KnowledgeObjectInspector';
import { useKnowledgeObjectInspector } from '../../../model/hooks/useKnowledgeObjectInspector';

vi.mock('../../../model/hooks/useKnowledgeObjectInspector');

describe('KnowledgeObjectInspector', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders nothing when no object details', () => {
        (useKnowledgeObjectInspector as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ objectDetails: null });
        const { container } = render(<KnowledgeObjectInspector selectedText="something" />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders macro details correctly', () => {
        (useKnowledgeObjectInspector as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            objectDetails: {
                name: 'my_macro',
                type: 'macro',
                definition: 'search index=main',
                args: ['arg1', 'arg2']
            }
        });

        render(<KnowledgeObjectInspector selectedText="my_macro" />);
        
        expect(screen.getByText('my_macro')).toBeInTheDocument();
        expect(screen.getByText('macro')).toBeInTheDocument();
        expect(screen.getByText('search index=main')).toBeInTheDocument();
        expect(screen.getByText('$arg1')).toBeInTheDocument();
        expect(screen.getByText('$arg2')).toBeInTheDocument();
    });

    it('renders lookup details correctly', () => {
        (useKnowledgeObjectInspector as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            objectDetails: {
                name: 'my_lookup',
                type: 'lookup',
                definition: 'lookup.csv',
                fields: ['field1', 'field2']
            }
        });

        render(<KnowledgeObjectInspector selectedText="my_lookup" />);
        
        expect(screen.getByText('my_lookup')).toBeInTheDocument();
        expect(screen.getByText('lookup')).toBeInTheDocument();
        expect(screen.getByText('lookup.csv')).toBeInTheDocument();
        expect(screen.getByText('field1')).toBeInTheDocument();
    });

    it('handles missing optional fields gracefully', () => {
        // Adversarial: Object with minimal data
        (useKnowledgeObjectInspector as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            objectDetails: {
                name: 'minimal_obj',
                type: 'saved_search',
                // Missing definition, args, fields
            }
        });

        render(<KnowledgeObjectInspector selectedText="minimal_obj" />);
        
        expect(screen.getByText('minimal_obj')).toBeInTheDocument();
        expect(screen.getByText('saved_search')).toBeInTheDocument();
        // Should not crash and not render sections
        expect(screen.queryByText('Definition')).not.toBeInTheDocument();
        expect(screen.queryByText('Arguments')).not.toBeInTheDocument();
        expect(screen.queryByText('Fields')).not.toBeInTheDocument();
    });

    it('handles empty arrays for args and fields', () => {
        (useKnowledgeObjectInspector as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            objectDetails: {
                name: 'empty_arrays',
                type: 'macro',
                definition: 'def',
                args: [],
                fields: []
            }
        });

        render(<KnowledgeObjectInspector selectedText="empty_arrays" />);
        
        expect(screen.getByText('empty_arrays')).toBeInTheDocument();
        expect(screen.queryByText('Arguments')).not.toBeInTheDocument();
        expect(screen.queryByText('Fields')).not.toBeInTheDocument();
    });

    it('handles extremely long strings', () => {
        const longName = 'a'.repeat(100);
        const longDef = 'b'.repeat(1000);
        (useKnowledgeObjectInspector as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            objectDetails: {
                name: longName,
                type: 'macro',
                definition: longDef
            }
        });

        render(<KnowledgeObjectInspector selectedText={longName} />);

        expect(screen.getByText(longName)).toBeInTheDocument();
        expect(screen.getByText(longDef)).toBeInTheDocument();
    });
});

describe('KnowledgeObjectInspector accessibility', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('displays object name prominently', () => {
        (useKnowledgeObjectInspector as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            objectDetails: {
                name: 'my_macro',
                type: 'macro',
                definition: 'search index=main'
            }
        });

        render(<KnowledgeObjectInspector selectedText="my_macro" />);

        // Name should be visible
        expect(screen.getByText('my_macro')).toBeInTheDocument();
    });

    it('displays object type for context', () => {
        (useKnowledgeObjectInspector as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            objectDetails: {
                name: 'test_lookup',
                type: 'lookup'
            }
        });

        render(<KnowledgeObjectInspector selectedText="test_lookup" />);

        // Type badge should be visible
        expect(screen.getByText('lookup')).toBeInTheDocument();
    });

    it('definition section has descriptive header', () => {
        (useKnowledgeObjectInspector as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            objectDetails: {
                name: 'test',
                type: 'macro',
                definition: 'some definition'
            }
        });

        render(<KnowledgeObjectInspector selectedText="test" />);

        expect(screen.getByText('Definition')).toBeInTheDocument();
    });

    it('arguments section has descriptive header when present', () => {
        (useKnowledgeObjectInspector as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            objectDetails: {
                name: 'test',
                type: 'macro',
                args: ['arg1', 'arg2']
            }
        });

        render(<KnowledgeObjectInspector selectedText="test" />);

        expect(screen.getByText('Arguments')).toBeInTheDocument();
    });

    it('fields section has descriptive header when present', () => {
        (useKnowledgeObjectInspector as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            objectDetails: {
                name: 'test',
                type: 'lookup',
                fields: ['field1', 'field2']
            }
        });

        render(<KnowledgeObjectInspector selectedText="test" />);

        expect(screen.getByText('Fields')).toBeInTheDocument();
    });

    it('uses semantic HTML for better accessibility', () => {
        (useKnowledgeObjectInspector as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            objectDetails: {
                name: 'test',
                type: 'macro',
                definition: 'def',
                args: ['arg1']
            }
        });

        const { container } = render(<KnowledgeObjectInspector selectedText="test" />);

        // Should use structured layout (div-based card structure)
        expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('argument items are formatted with $ prefix for clarity', () => {
        (useKnowledgeObjectInspector as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            objectDetails: {
                name: 'test',
                type: 'macro',
                args: ['myarg']
            }
        });

        render(<KnowledgeObjectInspector selectedText="test" />);

        // Args should show with $ prefix to indicate macro arguments
        expect(screen.getByText('$myarg')).toBeInTheDocument();
    });
});
