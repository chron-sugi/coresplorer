/**
 * FieldOriginBadge Component Tests
 *
 * Tests for the FieldOriginBadge component.
 *
 * @module features/field-hover/ui/FieldOriginBadge.test
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FieldOriginBadge } from './FieldOriginBadge';
import type { FieldEvent } from '@/entities/field/model/lineage.types';

describe('FieldOriginBadge', () => {
  it('shows "Unknown origin" when origin is null', () => {
    render(<FieldOriginBadge origin={null} />);

    expect(screen.getByText(/unknown origin/i)).toBeInTheDocument();
  });

  it('renders created event with command', () => {
    const origin: FieldEvent = {
      kind: 'created',
      command: 'eval',
      line: 5,
    };

    render(<FieldOriginBadge origin={origin} />);

    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('eval')).toBeInTheDocument();
  });

  it('renders modified event', () => {
    const origin: FieldEvent = {
      kind: 'modified',
      command: 'eval',
      line: 10,
    };

    render(<FieldOriginBadge origin={origin} />);

    expect(screen.getByText('Modified')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('eval')).toBeInTheDocument();
  });

  it('renders origin event (implicit field)', () => {
    const origin: FieldEvent = {
      kind: 'origin',
      command: 'implicit',
      line: 0,
    };

    render(<FieldOriginBadge origin={origin} />);

    expect(screen.getByText('Implicit field')).toBeInTheDocument();
    // Should not show line/command for implicit fields
    expect(screen.queryByText('at line')).not.toBeInTheDocument();
  });

  it('renders expression when provided', () => {
    const origin: FieldEvent = {
      kind: 'created',
      command: 'eval',
      line: 5,
      expression: 'count = count + 1',
    };

    render(<FieldOriginBadge origin={origin} />);

    expect(screen.getByText('count = count + 1')).toBeInTheDocument();
  });

  it('does not render expression when not provided', () => {
    const origin: FieldEvent = {
      kind: 'created',
      command: 'eval',
      line: 5,
    };

    const { container } = render(<FieldOriginBadge origin={origin} />);

    // Should not have the expression div
    expect(container.querySelector('.font-mono.text-2xs')).toBeNull();
  });

  it('renders consumed event', () => {
    const origin: FieldEvent = {
      kind: 'consumed',
      command: 'stats',
      line: 7,
    };

    render(<FieldOriginBadge origin={origin} />);

    expect(screen.getByText('Used')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('stats')).toBeInTheDocument();
  });

  it('renders dropped event', () => {
    const origin: FieldEvent = {
      kind: 'dropped',
      command: 'fields',
      line: 12,
    };

    render(<FieldOriginBadge origin={origin} />);

    expect(screen.getByText('Dropped')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('fields')).toBeInTheDocument();
  });

  it('handles unknown event kind gracefully', () => {
    const origin: FieldEvent = {
      kind: 'custom_kind' as any,
      command: 'custom',
      line: 1,
    };

    render(<FieldOriginBadge origin={origin} />);

    expect(screen.getByText('custom_kind')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('custom')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const origin: FieldEvent = {
      kind: 'created',
      command: 'eval',
      line: 5,
    };

    const { container } = render(<FieldOriginBadge origin={origin} className="custom-class" />);

    expect(container.querySelector('.custom-class')).toBeTruthy();
  });

  it('renders all text components in correct order', () => {
    const origin: FieldEvent = {
      kind: 'created',
      command: 'eval',
      line: 5,
      expression: 'x = y + z',
    };

    render(<FieldOriginBadge origin={origin} />);

    const text = screen.getByText(/Created/).closest('div')?.textContent;
    expect(text).toContain('Created');
    expect(text).toContain('at line');
    expect(text).toContain('5');
    expect(text).toContain('by');
    expect(text).toContain('eval');
  });
});
