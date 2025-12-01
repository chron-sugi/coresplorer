import { describe, it, expect } from 'vitest';
import {
  ImpactModeSchema,
  HighlightResultSchema,
  ComputeHighlightsParamsSchema,
} from './graph-utils.schemas';

describe('graph-utils.schemas', () => {
  it('validates allowed impact modes', () => {
    expect(ImpactModeSchema.parse('upstream')).toBe('upstream');
    expect(() => ImpactModeSchema.parse('invalid')).toThrowError();
  });

  it('validates highlight result schema', () => {
    const result = HighlightResultSchema.parse({
      nodes: new Set(['a', 'b']),
      edges: new Set(['e1']),
    });
    expect(result.nodes.has('a')).toBe(true);
    expect(() => HighlightResultSchema.parse({ nodes: ['a'], edges: ['e1'] })).toThrowError();
  });

  it('validates compute highlights params structure', () => {
    const params = ComputeHighlightsParamsSchema.parse({
      focusNodeId: 'node-1',
      impactMode: 'both',
      incomingMap: { 'node-1': new Set(['node-0']) },
      outgoingMap: { 'node-1': new Set(['node-2']) },
      edges: [{ id: 'e1', source: 'node-1', target: 'node-2' }],
    });

    expect(params.focusNodeId).toBe('node-1');
    expect(params.incomingMap['node-1'].has('node-0')).toBe(true);

    expect(() =>
      ComputeHighlightsParamsSchema.parse({
        focusNodeId: null,
        impactMode: 'both',
        incomingMap: { bad: ['not-a-set'] },
        outgoingMap: {},
        edges: [],
      }),
    ).toThrowError();
  });
});
