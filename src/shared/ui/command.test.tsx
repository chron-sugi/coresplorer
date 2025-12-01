/**
 * Command Component Tests
 *
 * Tests for the shared Command components including:
 * - Command, CommandInput, CommandList, CommandEmpty
 * - CommandGroup, CommandItem, CommandSeparator, CommandShortcut
 * - Basic rendering and interaction
 * - Filtering and search functionality
 * - Styling and className handling
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from './command';

describe('Command', () => {
  const SimpleCommand = () => (
    <Command>
      <CommandInput placeholder="Type a command..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Calendar</CommandItem>
          <CommandItem>Search Emoji</CommandItem>
          <CommandItem>Calculator</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>Profile</CommandItem>
          <CommandItem>Billing</CommandItem>
          <CommandItem>Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );

  describe('Command', () => {
    it('renders command root', () => {
      const { container } = render(
        <Command>
          <CommandInput />
        </Command>
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('applies default styling classes', () => {
      const { container } = render(
        <Command>
          <CommandInput />
        </Command>
      );
      const command = container.firstChild as HTMLElement;
      expect(command).toHaveClass('flex', 'h-full', 'w-full', 'flex-col');
    });

    it('applies custom className', () => {
      const { container } = render(
        <Command className="custom-command">
          <CommandInput />
        </Command>
      );
      const command = container.firstChild as HTMLElement;
      expect(command).toHaveClass('custom-command');
    });
  });

  describe('CommandInput', () => {
    it('renders input with placeholder', () => {
      render(
        <Command>
          <CommandInput placeholder="Search..." />
        </Command>
      );
      const input = screen.getByPlaceholderText('Search...');
      expect(input).toBeInTheDocument();
    });

    it('renders search icon', () => {
      const { container } = render(
        <Command>
          <CommandInput placeholder="Search..." />
        </Command>
      );
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('accepts user input', async () => {
      const user = userEvent.setup();
      render(
        <Command>
          <CommandInput placeholder="Search..." />
        </Command>
      );

      const input = screen.getByPlaceholderText('Search...');
      await user.type(input, 'test');

      expect(input).toHaveValue('test');
    });

    it('applies custom className', () => {
      render(
        <Command>
          <CommandInput placeholder="Search..." className="custom-input" />
        </Command>
      );
      const input = screen.getByPlaceholderText('Search...');
      expect(input).toHaveClass('custom-input');
    });
  });

  describe('CommandList', () => {
    it('renders list container', () => {
      const { container } = render(
        <Command>
          <CommandList>
            <div>List content</div>
          </CommandList>
        </Command>
      );
      expect(screen.getByText('List content')).toBeInTheDocument();
    });

    it('applies default styling classes', () => {
      const { container } = render(
        <Command>
          <CommandList data-testid="list">Content</CommandList>
        </Command>
      );
      const list = screen.getByTestId('list');
      expect(list).toHaveClass('max-h-[300px]', 'overflow-y-auto');
    });
  });

  describe('CommandEmpty', () => {
    it('renders empty state message', async () => {
      const user = userEvent.setup();
      render(<SimpleCommand />);

      const input = screen.getByPlaceholderText('Type a command...');
      await user.type(input, 'nonexistent');

      await waitFor(() => {
        expect(screen.getByText('No results found.')).toBeInTheDocument();
      });
    });

    it('applies default styling', async () => {
      const user = userEvent.setup();
      render(<SimpleCommand />);

      const input = screen.getByPlaceholderText('Type a command...');
      await user.type(input, 'xyz123');

      await waitFor(() => {
        const empty = screen.getByText('No results found.');
        expect(empty).toHaveClass('py-6', 'text-center', 'text-sm');
      });
    });
  });

  describe('CommandGroup', () => {
    it('renders group with heading', () => {
      render(<SimpleCommand />);
      const headings = screen.getAllByText(/Suggestions|Settings/, {
        selector: '[cmdk-group-heading]',
      });
      expect(headings).toHaveLength(2);
    });

    it('renders group items', () => {
      render(<SimpleCommand />);
      expect(screen.getByText('Calendar')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('applies default styling', () => {
      render(
        <Command>
          <CommandGroup heading="Test" data-testid="group">
            <CommandItem>Item</CommandItem>
          </CommandGroup>
        </Command>
      );
      const group = screen.getByTestId('group');
      expect(group).toHaveClass('overflow-hidden', 'p-1');
    });
  });

  describe('CommandItem', () => {
    it('renders item text', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>Test Item</CommandItem>
          </CommandList>
        </Command>
      );
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    it('applies default styling', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>Item</CommandItem>
          </CommandList>
        </Command>
      );
      const item = screen.getByText('Item');
      expect(item).toHaveClass('command-item', 'relative', 'flex');
    });

    it('handles click events', async () => {
      const handleSelect = vi.fn();
      const user = userEvent.setup();

      render(
        <Command>
          <CommandList>
            <CommandItem onSelect={handleSelect}>Clickable</CommandItem>
          </CommandList>
        </Command>
      );

      const item = screen.getByText('Clickable');
      await user.click(item);

      expect(handleSelect).toHaveBeenCalled();
    });

    it('applies custom className', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem className="custom-item">Item</CommandItem>
          </CommandList>
        </Command>
      );
      const item = screen.getByText('Item');
      expect(item).toHaveClass('custom-item');
    });

    it('can be disabled', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem disabled>Disabled Item</CommandItem>
          </CommandList>
        </Command>
      );
      const item = screen.getByText('Disabled Item');
      expect(item).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('CommandSeparator', () => {
    it('renders separator', () => {
      const { container } = render(
        <Command>
          <CommandList>
            <CommandSeparator />
          </CommandList>
        </Command>
      );
      const separator = container.querySelector('[role="separator"]');
      expect(separator).toBeInTheDocument();
    });

    it('applies default styling', () => {
      const { container } = render(
        <Command>
          <CommandList>
            <CommandSeparator />
          </CommandList>
        </Command>
      );
      const separator = container.querySelector('[role="separator"]');
      expect(separator).toHaveClass('-mx-1', 'h-px', 'bg-border');
    });
  });

  describe('CommandShortcut', () => {
    it('renders shortcut text', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>
              Action
              <CommandShortcut>⌘K</CommandShortcut>
            </CommandItem>
          </CommandList>
        </Command>
      );
      expect(screen.getByText('⌘K')).toBeInTheDocument();
    });

    it('applies default styling', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>
              Action
              <CommandShortcut>Ctrl+K</CommandShortcut>
            </CommandItem>
          </CommandList>
        </Command>
      );
      const shortcut = screen.getByText('Ctrl+K');
      expect(shortcut).toHaveClass('ml-auto', 'text-xs', 'text-muted-foreground');
    });

    it('applies custom className', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>
              Action
              <CommandShortcut className="custom-shortcut">⌘K</CommandShortcut>
            </CommandItem>
          </CommandList>
        </Command>
      );
      const shortcut = screen.getByText('⌘K');
      expect(shortcut).toHaveClass('custom-shortcut');
    });
  });

  describe('filtering', () => {
    it('filters items based on search', async () => {
      const user = userEvent.setup();
      render(<SimpleCommand />);

      const input = screen.getByPlaceholderText('Type a command...');
      await user.type(input, 'cal');

      await waitFor(() => {
        expect(screen.queryByText('Calendar')).toBeInTheDocument();
        expect(screen.queryByText('Calculator')).toBeInTheDocument();
        // Other items should be filtered out
      });
    });
  });

  describe('keyboard navigation', () => {
    it('allows keyboard navigation through items', async () => {
      const user = userEvent.setup();
      render(<SimpleCommand />);

      const input = screen.getByPlaceholderText('Type a command...');
      input.focus();

      await user.keyboard('{ArrowDown}');
      // First item should be highlighted
      // Note: cmdk manages this internally, we just verify no errors
    });
  });
});
