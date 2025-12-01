import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { SchemaEditor } from './SchemaEditor';
import { useSchemaStore } from '../../../model/store/schema.store';
import { SCHEMA_TYPES } from '../../../model/constants/splinter.constants';

describe('SchemaEditor Integration', () => {
    beforeEach(() => {
        useSchemaStore.setState({
            fields: [
                { id: '1', name: 'host', type: SCHEMA_TYPES.STRING },
                { id: '2', name: 'status', type: SCHEMA_TYPES.NUMBER }
            ]
        });
    });

    it('displays the list of fields from the store', () => {
        render(<SchemaEditor />);

        expect(screen.getByText('host')).toBeInTheDocument();
        expect(screen.getByText('status')).toBeInTheDocument();
        expect(screen.getByText('string')).toBeInTheDocument();
        expect(screen.getByText('number')).toBeInTheDocument();
    });

    it('adds a new field to the store when form is submitted', () => {
        render(<SchemaEditor />);

        // Find inputs
        const nameInput = screen.getByPlaceholderText('Field name');
        const typeSelect = screen.getByRole('combobox');
        const addButton = screen.getByText('Add Field');

        // Fill form
        fireEvent.change(nameInput, { target: { value: 'new_field' } });
        fireEvent.change(typeSelect, { target: { value: SCHEMA_TYPES.BOOLEAN } });
        fireEvent.click(addButton);

        // Check UI
        expect(screen.getByText('new_field')).toBeInTheDocument();
        expect(screen.getByText('boolean')).toBeInTheDocument();

        // Check Store
        const state = useSchemaStore.getState();
        expect(state.fields).toHaveLength(3);
        expect(state.fields.find(f => f.name === 'new_field')).toBeDefined();
    });

    it('removes a field from the store when delete button is clicked', () => {
        render(<SchemaEditor />);

        // Find delete buttons
        const deleteButtons = screen.getAllByLabelText('Remove field');
        expect(deleteButtons).toHaveLength(2); // host, status

        // Click the first one (host)
        fireEvent.click(deleteButtons[0]);

        // Check UI
        expect(screen.queryByText('host')).not.toBeInTheDocument();
        expect(screen.getByText('status')).toBeInTheDocument();

        // Check Store
        const state = useSchemaStore.getState();
        expect(state.fields).toHaveLength(1);
        expect(state.fields[0].name).toBe('status');
    });
});
