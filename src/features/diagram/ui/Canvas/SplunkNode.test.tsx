import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SplunkNode } from './SplunkNode';

// Mock dependencies
vi.mock('@xyflow/react', () => ({
    Handle: ({ type, position }: { type: string; position: string }) => (
        <div data-testid={`handle-${type}-${position}`} />
    ),
    Position: {
        Top: 'top',
        Bottom: 'bottom',
    },
    NodeToolbar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}));

vi.mock('@/entities/knowledge-object', () => ({
    SPLUNK_KO_ICONS: {},
    SPLUNK_KO_TYPES: {},
}));

vi.mock('@/shared/config', () => ({
    themeConfig: {
        colors: {
            koTypes: {},
        },
    },
}));

vi.mock('@/shared/lib/splunk-url-builder', () => ({
    buildSplunkUrl: vi.fn(),
    isSplunkWebUrlAvailable: () => false,
}));

vi.mock('@/shared/lib', () => ({
    encodeUrlParam: (str: string) => str,
}));

vi.mock('./SplunkNode.variants', () => ({
    splunkNodeVariants: () => 'mock-node-class',
    splunkNodeIconVariants: () => 'mock-icon-class',
    splunkNodeIconElementVariants: () => 'mock-icon-element-class',
    splunkNodeLabelVariants: () => 'mock-label-class',
    computeNodeState: () => 'normal',
}));

describe('SplunkNode', () => {
    const baseProps = {
        id: 'node-1',
        data: {
            label: 'Test Node',
            object_type: 'saved_search',
        },
        selected: false,
        type: 'splunk',
    } as any;

    it('renders node label', () => {
        render(<SplunkNode {...baseProps} />);
        expect(screen.getByText('Test Node')).toBeInTheDocument();
    });

    it('renders handles (source and target)', () => {
        render(<SplunkNode {...baseProps} />);
        expect(screen.getByTestId('handle-target-top')).toBeInTheDocument();
        expect(screen.getByTestId('handle-source-bottom')).toBeInTheDocument();
    });

    it('handles unknown object type gracefully', () => {
        const propsWithUnknownType = {
            ...baseProps,
            data: { ...baseProps.data, object_type: undefined },
        };
        render(<SplunkNode {...propsWithUnknownType} />);
        expect(screen.getByText('Test Node')).toBeInTheDocument();
    });
});
