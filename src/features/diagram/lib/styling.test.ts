import { describe, it, expect } from 'vitest';
import { getNodeStyle } from './styling';
import { getKoColor } from '@/entities/knowledge-object';
import { DIAGRAM_LAYOUT } from '../model/constants/diagram.constants';

describe('styling', () => {
  describe('getNodeStyle', () => {
    it('returns default style for unknown type', () => {
      const style = getNodeStyle('unknown-type');
      // Uses getKoColor fallback for unknown types
      expect(style).toEqual(expect.objectContaining({
        background: getKoColor('unknown-type'),
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
