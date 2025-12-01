import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Unit Test Setup', () => {
  it('should pass a basic math test', () => {
    expect(1 + 1).toBe(2);
  });
});

describe('Component Test Setup', () => {
  it('should render a simple component', () => {
    function TestComponent() {
      return <div>Hello Testing World</div>;
    }

    render(<TestComponent />);
    expect(screen.getByText('Hello Testing World')).toBeInTheDocument();
  });
});
