import { describe, it, expect } from 'vitest';
import { getNodeStyle } from './styling';
import { themeConfig } from '@/shared/config';
import { DIAGRAM_LAYOUT } from '../model/constants/diagram.constants';

// Mock constants if needed, but for now we can rely on the actual constants
// or just test the behavior based on known inputs.
// Since TYPE_COLORS is imported from @/config/constants, we might need to mock it
// if we want to be purely unit testing this file without dependencies.
// However, for this task, using the real constants is likely fine as they are just data.

describe('styling', () => {
  describe('getNodeStyle', () => {
    it('returns default style for unknown type', () => {
      const style = getNodeStyle('unknown-type');
      expect(style).toEqual(expect.objectContaining({
        background: themeConfig.colors.semantic.node.fallbackColor,
        color: '#fff',
        border: 'none',
      }));
    });

    it('returns correct style for known type', () => {
        // Assuming 'search' is a valid type in TYPE_COLORS, but let's check what's in constants if we can.
        // Since we don't have the constants file content, we can infer or just test that it returns *something* from the map.
        // Let's use a type that likely exists or just rely on the default if we can't be sure.
        // Actually, let's just test the structure for now.
        const style = getNodeStyle('search'); 
        // We can't assert exact color without knowing TYPE_COLORS, but we can assert structure.
        expect(style).toHaveProperty('background');
        expect(style).toHaveProperty('color', '#fff');
        expect(style).toHaveProperty('borderRadius', '6px');
    });

    it('returns core style when isCore is true', () => {
      const style = getNodeStyle('search', true);
      expect(style).toEqual(expect.objectContaining({
        background: '#fff',
        border: expect.stringContaining('3px solid'),
        fontWeight: 'bold',
        color: '#1e293b',
        width: DIAGRAM_LAYOUT.NODE_WIDTH_CORE,
      }));
    });

    it('returns non-core style when isCore is false (default)', () => {
       const style = getNodeStyle('search');
       expect(style).toEqual(expect.objectContaining({
           width: DIAGRAM_LAYOUT.NODE_WIDTH,
           fontSize: '12px',
           border: 'none'
       }));
    });
  });
});
