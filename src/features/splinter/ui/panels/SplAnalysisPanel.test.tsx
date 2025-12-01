import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { SplAnalysisPanel } from './SplAnalysisPanel';
import { useEditorStore } from '@/entities/spl';

// Mock SplStaticEditor to expose the code prop for assertions
vi.mock('@/widgets/spl-static-editor/ui/SplStaticEditor', () => ({
    SplStaticEditor: ({ code }: { code: string }) => <div>Code: {code}</div>,
}));

describe('SplAnalysisPanel', () => {
    test('renders code from shared editor store', () => {
        useEditorStore.setState({ splText: 'test code' });
        render(<SplAnalysisPanel />);
        expect(screen.getByText('Code: test code')).toBeInTheDocument();
    });
});
