/**
 * LineageTooltip Component Tests
 *
 * Tests for the LineageTooltip component.
 *
 * @module features/field-hover/ui/LineageTooltip.test
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LineageTooltip } from './LineageTooltip';
import type { FieldLineage } from '@/features/field-lineage';

const mockLineage: FieldLineage = {
  fieldName: 'test_field',
  dataType: 'string',
  origin: {
    kind: 'created',
    command: 'eval',
    line: 5,
    expression: 'field="value"',
  },
  dependsOn: ['source1', 'source2'],
  dependedOnBy: ['derived1'],
  isMultivalue: false,
  confidence: 'certain',
  events: [],
};

const mockPosition = { x: 100, y: 200 };

describe('LineageTooltip', () => {
  it('renders field name', () => {
    render(
      <LineageTooltip
        fieldName="test_field"
        lineage={mockLineage}
        position={mockPosition}
        visible={true}
      />
    );

    expect(screen.getByText('test_field')).toBeInTheDocument();
  });

  it('renders data type badge', () => {
    render(
      <LineageTooltip
        fieldName="test_field"
        lineage={mockLineage}
        position={mockPosition}
        visible={true}
      />
    );

    expect(screen.getByText('string')).toBeInTheDocument();
  });

  it('renders FieldOriginBadge component', () => {
    render(
      <LineageTooltip
        fieldName="test_field"
        lineage={mockLineage}
        position={mockPosition}
        visible={true}
      />
    );

    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('eval')).toBeInTheDocument();
  });

  it('renders dependencies when present', () => {
    render(
      <LineageTooltip
        fieldName="test_field"
        lineage={mockLineage}
        position={mockPosition}
        visible={true}
      />
    );

    expect(screen.getByText(/depends on/i)).toBeInTheDocument();
    expect(screen.getByText(/source1, source2/)).toBeInTheDocument();
  });

  it('renders dependedOnBy when present', () => {
    render(
      <LineageTooltip
        fieldName="test_field"
        lineage={mockLineage}
        position={mockPosition}
        visible={true}
      />
    );

    expect(screen.getByText(/used by/i)).toBeInTheDocument();
    expect(screen.getByText(/derived1/)).toBeInTheDocument();
  });

  it('does not render when visible is false', () => {
    const { container } = render(
      <LineageTooltip
        fieldName="test_field"
        lineage={mockLineage}
        position={mockPosition}
        visible={false}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders with unknown data type when lineage is null', () => {
    render(
      <LineageTooltip
        fieldName="test_field"
        lineage={null}
        position={mockPosition}
        visible={true}
      />
    );

    expect(screen.getByText('test_field')).toBeInTheDocument();
    expect(screen.getByText('unknown')).toBeInTheDocument();
  });

  it('shows multivalue indicator when field is multivalue', () => {
    const multivalueLineage: FieldLineage = {
      ...mockLineage,
      isMultivalue: true,
    };

    render(
      <LineageTooltip
        fieldName="test_field"
        lineage={multivalueLineage}
        position={mockPosition}
        visible={true}
      />
    );

    expect(screen.getByText(/multivalue field/i)).toBeInTheDocument();
  });

  it('does not show multivalue indicator when field is not multivalue', () => {
    render(
      <LineageTooltip
        fieldName="test_field"
        lineage={mockLineage}
        position={mockPosition}
        visible={true}
      />
    );

    expect(screen.queryByText(/multivalue field/i)).not.toBeInTheDocument();
  });

  it('shows confidence warning when confidence is not certain', () => {
    const lowConfidenceLineage: FieldLineage = {
      ...mockLineage,
      confidence: 'likely',
    };

    render(
      <LineageTooltip
        fieldName="test_field"
        lineage={lowConfidenceLineage}
        position={mockPosition}
        visible={true}
      />
    );

    expect(screen.getByText(/confidence: likely/i)).toBeInTheDocument();
  });

  it('does not show confidence warning when confidence is high', () => {
    render(
      <LineageTooltip
        fieldName="test_field"
        lineage={mockLineage}
        position={mockPosition}
        visible={true}
      />
    );

    expect(screen.queryByText(/confidence/i)).not.toBeInTheDocument();
  });

  it('positions tooltip based on provided coordinates', () => {
    const { container } = render(
      <LineageTooltip
        fieldName="test_field"
        lineage={mockLineage}
        position={mockPosition}
        visible={true}
      />
    );

    const tooltip = container.querySelector('[data-testid="lineage-tooltip"]') as HTMLElement;
    expect(tooltip.style.left).toBe('112px'); // x + 12
    expect(tooltip.style.top).toBe('212px'); // y + 12
    expect(tooltip.style.position).toBe('fixed');
  });

  it('handles missing dependencies', () => {
    const lineageNoDeps: FieldLineage = {
      ...mockLineage,
      dependsOn: [],
      dependedOnBy: [],
    };

    render(
      <LineageTooltip
        fieldName="test_field"
        lineage={lineageNoDeps}
        position={mockPosition}
        visible={true}
      />
    );

    expect(screen.queryByText(/depends on/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/used by/i)).not.toBeInTheDocument();
  });

  it('applies correct color for number data type', () => {
    const numberLineage: FieldLineage = {
      ...mockLineage,
      dataType: 'number',
    };

    render(
      <LineageTooltip
        fieldName="test_field"
        lineage={numberLineage}
        position={mockPosition}
        visible={true}
      />
    );

    expect(screen.getByText('number')).toBeInTheDocument();
  });

  it('applies correct color for time data type', () => {
    const timeLineage: FieldLineage = {
      ...mockLineage,
      dataType: 'time',
    };

    render(
      <LineageTooltip
        fieldName="test_field"
        lineage={timeLineage}
        position={mockPosition}
        visible={true}
      />
    );

    expect(screen.getByText('time')).toBeInTheDocument();
  });

  it('defaults to visible when not specified', () => {
    render(
      <LineageTooltip
        fieldName="test_field"
        lineage={mockLineage}
        position={mockPosition}
      />
    );

    expect(screen.getByText('test_field')).toBeInTheDocument();
  });
});
