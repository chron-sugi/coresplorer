import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useDiagramStore } from './diagram.store';

describe('useDiagramStore', () => {
    beforeEach(() => {
        // Reset store to initial state before each test
        act(() => {
            useDiagramStore.getState().reset();
        });
    });

    describe('coreId', () => {
        it('should have empty coreId by default', () => {
            const { result } = renderHook(() => useDiagramStore());
            expect(result.current.coreId).toBe('');
        });

        it('should set coreId', () => {
            const { result } = renderHook(() => useDiagramStore());
            
            act(() => {
                result.current.setCoreId('node-2');
            });
            
            expect(result.current.coreId).toBe('node-2');
        });
    });

    describe('hiddenTypes', () => {
        it('should have empty hiddenTypes by default', () => {
            const { result } = renderHook(() => useDiagramStore());
            expect(result.current.hiddenTypes.size).toBe(0);
        });

        it('should toggle hidden types on', () => {
            const { result } = renderHook(() => useDiagramStore());
            
            act(() => {
                result.current.toggleHiddenType('dashboard');
            });
            
            expect(result.current.hiddenTypes.has('dashboard')).toBe(true);
        });

        it('should toggle hidden types off', () => {
            const { result } = renderHook(() => useDiagramStore());
            
            act(() => {
                result.current.toggleHiddenType('dashboard');
                result.current.toggleHiddenType('dashboard');
            });
            
            expect(result.current.hiddenTypes.has('dashboard')).toBe(false);
        });

        it('should handle multiple hidden types', () => {
            const { result } = renderHook(() => useDiagramStore());
            
            act(() => {
                result.current.toggleHiddenType('dashboard');
                result.current.toggleHiddenType('savedsearch');
            });
            
            expect(result.current.hiddenTypes.has('dashboard')).toBe(true);
            expect(result.current.hiddenTypes.has('savedsearch')).toBe(true);
            expect(result.current.hiddenTypes.size).toBe(2);
        });
    });

    describe('selectedNodeId', () => {
        it('should have null selectedNodeId by default', () => {
            const { result } = renderHook(() => useDiagramStore());
            expect(result.current.selectedNodeId).toBeNull();
        });

        it('should set selectedNodeId', () => {
            const { result } = renderHook(() => useDiagramStore());
            
            act(() => {
                result.current.setSelectedNodeId('node-123');
            });
            
            expect(result.current.selectedNodeId).toBe('node-123');
        });

        it('should clear selectedNodeId', () => {
            const { result } = renderHook(() => useDiagramStore());
            
            act(() => {
                result.current.setSelectedNodeId('node-123');
                result.current.setSelectedNodeId(null);
            });
            
            expect(result.current.selectedNodeId).toBeNull();
        });
    });

    describe('activeTab', () => {
        it('should have "details" as default activeTab', () => {
            const { result } = renderHook(() => useDiagramStore());
            expect(result.current.activeTab).toBe('details');
        });

        it('should set activeTab to "spl"', () => {
            const { result } = renderHook(() => useDiagramStore());
            
            act(() => {
                result.current.setActiveTab('spl');
            });
            
            expect(result.current.activeTab).toBe('spl');
        });

        it('should set activeTab to "impact"', () => {
            const { result } = renderHook(() => useDiagramStore());
            
            act(() => {
                result.current.setActiveTab('impact');
            });
            
            expect(result.current.activeTab).toBe('impact');
        });
    });

    describe('autoImpactMode', () => {
        it('should have autoImpactMode enabled by default', () => {
            const { result } = renderHook(() => useDiagramStore());
            expect(result.current.autoImpactMode).toBe(true);
        });

        it('should disable autoImpactMode', () => {
            const { result } = renderHook(() => useDiagramStore());
            
            act(() => {
                result.current.setAutoImpactMode(false);
            });
            
            expect(result.current.autoImpactMode).toBe(false);
        });

        it('should enable autoImpactMode', () => {
            const { result } = renderHook(() => useDiagramStore());
            
            act(() => {
                result.current.setAutoImpactMode(false);
                result.current.setAutoImpactMode(true);
            });
            
            expect(result.current.autoImpactMode).toBe(true);
        });
    });

    describe('reset', () => {
        it('should reset all state to initial values', () => {
            const { result } = renderHook(() => useDiagramStore());
            
            // Change all values
            act(() => {
                result.current.setCoreId('node-99');
                result.current.toggleHiddenType('dashboard');
                result.current.setSelectedNodeId('node-123');
                result.current.setActiveTab('spl');
                result.current.setAutoImpactMode(false);
            });
            
            // Reset
            act(() => {
                result.current.reset();
            });
            
            // Verify all back to defaults
            expect(result.current.coreId).toBe('');
            expect(result.current.hiddenTypes.size).toBe(0);
            expect(result.current.selectedNodeId).toBeNull();
            expect(result.current.activeTab).toBe('details');
            expect(result.current.autoImpactMode).toBe(true);
        });
    });

    describe('selector pattern', () => {
        it('should work with selectors', () => {
            const { result } = renderHook(() => 
                useDiagramStore((state) => ({
                    coreId: state.coreId,
                    setCoreId: state.setCoreId,
                }))
            );
            
            act(() => {
                result.current.setCoreId('node-5');
            });
            
            expect(result.current.coreId).toBe('node-5');
        });
    });
});
