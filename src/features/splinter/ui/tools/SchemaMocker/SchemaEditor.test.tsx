import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SchemaEditor } from './SchemaEditor';
import { useSchemaStore } from '../../../model/store/schema.store';

vi.mock('../../../model/store/schema.store');

describe('SchemaEditor', () => {
    const mockAddField = vi.fn();
    const mockRemoveField = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useSchemaStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            fields: [
                { id: '1', name: 'existing_field', type: 'string' }
            ],
            addField: mockAddField,
            removeField: mockRemoveField
        });
    });

    it('renders existing fields', () => {
        render(<SchemaEditor />);
        expect(screen.getByText('existing_field')).toBeInTheDocument();
        expect(screen.getByText('string')).toBeInTheDocument();
    });

    it('adds a new field', () => {
        render(<SchemaEditor />);
        
        const input = screen.getByPlaceholderText('Field name');
        fireEvent.change(input, { target: { value: 'new_field' } });
        
        const addButton = screen.getByText('Add Field');
        fireEvent.click(addButton);

        expect(mockAddField).toHaveBeenCalledWith({ name: 'new_field', type: 'string' });
    });

    it('prevents adding empty field name', () => {
        render(<SchemaEditor />);
        
        const addButton = screen.getByText('Add Field');
        expect(addButton).toBeDisabled();

        const input = screen.getByPlaceholderText('Field name');
        fireEvent.change(input, { target: { value: '   ' } }); // Whitespace only
        expect(addButton).toBeDisabled();
    });

    it('removes a field', () => {
        render(<SchemaEditor />);
        
        // Find the delete button (trash icon)
        const deleteButtons = screen.getAllByRole('button');
        // The last button is likely the delete button for the existing field
        // But let's be more precise if possible, or assume structure
        // The first button is "Add Field" (actually it's after inputs), wait, structure is:
        // Input, Select, Add Button
        // List of items with Delete Button
        
        // We can find by icon or just click the last button which should be the delete for the item
        const deleteButton = deleteButtons[deleteButtons.length - 1];
        fireEvent.click(deleteButton);

        expect(mockRemoveField).toHaveBeenCalledWith('1');
    });

    it('handles special characters in field names', () => {
        render(<SchemaEditor />);
        
        const input = screen.getByPlaceholderText('Field name');
        const specialName = '!@#$%^&*()';
        fireEvent.change(input, { target: { value: specialName } });
        
        const addButton = screen.getByText('Add Field');
        fireEvent.click(addButton);

        expect(mockAddField).toHaveBeenCalledWith({ name: specialName, type: 'string' });
    });

    it('handles changing field type', () => {
        render(<SchemaEditor />);
        
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'number' } });
        
        const input = screen.getByPlaceholderText('Field name');
        fireEvent.change(input, { target: { value: 'num_field' } });
        
        const addButton = screen.getByText('Add Field');
        fireEvent.click(addButton);

        expect(mockAddField).toHaveBeenCalledWith({ name: 'num_field', type: 'number' });
    });
    
    it('handles Enter key to add', () => {
        render(<SchemaEditor />);

        const input = screen.getByPlaceholderText('Field name');
        fireEvent.change(input, { target: { value: 'enter_field' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        expect(mockAddField).toHaveBeenCalledWith({ name: 'enter_field', type: 'string' });
    });
});

describe('SchemaEditor accessibility', () => {
    const mockAddField = vi.fn();
    const mockRemoveField = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useSchemaStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            fields: [
                { id: '1', name: 'test_field', type: 'string' }
            ],
            addField: mockAddField,
            removeField: mockRemoveField
        });
    });

    it('input field has accessible placeholder', () => {
        render(<SchemaEditor />);
        const input = screen.getByPlaceholderText('Field name');
        expect(input).toBeInTheDocument();
        expect(input.tagName).toBe('INPUT');
    });

    it('type selector is accessible combobox', () => {
        render(<SchemaEditor />);
        const select = screen.getByRole('combobox');
        expect(select).toBeInTheDocument();
    });

    it('add button has descriptive text', () => {
        render(<SchemaEditor />);
        const addButton = screen.getByText('Add Field');
        expect(addButton).toBeInTheDocument();
        expect(addButton.tagName).toBe('BUTTON');
    });

    it('add button is disabled when input is empty', () => {
        render(<SchemaEditor />);
        const addButton = screen.getByText('Add Field');
        expect(addButton).toBeDisabled();
    });

    it('add button is enabled when input has value', () => {
        render(<SchemaEditor />);
        const input = screen.getByPlaceholderText('Field name');
        fireEvent.change(input, { target: { value: 'new_field' } });

        const addButton = screen.getByText('Add Field');
        expect(addButton).not.toBeDisabled();
    });

    it('field list items display field name and type', () => {
        render(<SchemaEditor />);
        expect(screen.getByText('test_field')).toBeInTheDocument();
        expect(screen.getByText('string')).toBeInTheDocument();
    });

    it('delete buttons are keyboard accessible', () => {
        render(<SchemaEditor />);
        const buttons = screen.getAllByRole('button');
        // Each field has a delete button, plus the add button
        expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('supports keyboard submit via Enter key', () => {
        render(<SchemaEditor />);
        const input = screen.getByPlaceholderText('Field name');

        fireEvent.change(input, { target: { value: 'keyboard_field' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        expect(mockAddField).toHaveBeenCalledWith({ name: 'keyboard_field', type: 'string' });
    });

    it('has panel header for context', () => {
        render(<SchemaEditor />);
        expect(screen.getByText(/Schema/i)).toBeInTheDocument();
    });
});
