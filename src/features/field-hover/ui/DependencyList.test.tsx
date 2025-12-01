/**
 * DependencyList Component Tests
 *
 * Tests for the DependencyList component.
 *
 * @module features/field-hover/ui/DependencyList.test
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DependencyList } from './DependencyList';

describe('DependencyList', () => {
  it('renders list of dependencies', () => {
    render(<DependencyList dependencies={['field1', 'field2', 'field3']} />);

    expect(screen.getByText('field1, field2, field3')).toBeInTheDocument();
  });

  it('renders default label "Depends on"', () => {
    render(<DependencyList dependencies={['field1']} />);

    expect(screen.getByText(/depends on:/i)).toBeInTheDocument();
  });

  it('renders custom label when provided', () => {
    render(<DependencyList dependencies={['field1']} label="Used by" />);

    expect(screen.getByText(/used by:/i)).toBeInTheDocument();
  });

  it('returns null when dependencies array is empty', () => {
    const { container } = render(<DependencyList dependencies={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders single dependency', () => {
    render(<DependencyList dependencies={['single_field']} />);

    expect(screen.getByText('single_field')).toBeInTheDocument();
  });

  it('joins multiple dependencies with comma and space', () => {
    render(<DependencyList dependencies={['a', 'b', 'c']} />);

    expect(screen.getByText('a, b, c')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <DependencyList dependencies={['field1']} className="custom-class" />
    );

    expect(container.querySelector('.custom-class')).toBeTruthy();
  });

  it('renders with monospace font for field names', () => {
    const { container } = render(<DependencyList dependencies={['field1']} />);

    const fieldSpan = screen.getByText('field1');
    expect(fieldSpan.className).toContain('font-mono');
  });

  it('handles many dependencies', () => {
    const manyDeps = Array.from({ length: 10 }, (_, i) => `field${i + 1}`);
    render(<DependencyList dependencies={manyDeps} />);

    expect(screen.getByText(/field1, field2, field3/)).toBeInTheDocument();
  });

  it('renders label and dependencies in correct order', () => {
    render(<DependencyList dependencies={['field1', 'field2']} label="Requires" />);

    const container = screen.getByText('Requires:').parentElement;
    const text = container?.textContent;
    expect(text).toBe('Requires: field1, field2');
  });
});
