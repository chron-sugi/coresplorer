import React, { useState } from 'react';
import { useSchemaStore } from '../../../model/store/schema.store';
import { Database, Plus, Trash2 } from 'lucide-react';
import { SCHEMA_TYPES } from '../../../model/constants/splinter.constants';
import type { MockField } from '../../../model/splinter.schemas';
import { panelHeaderVariants } from '../../../splinter.variants';

/**
 * Schema editor component for managing mock schema fields.
 *
 * Provides a UI for adding and removing fields from the mock schema used
 * for SPL query analysis. Users can define field names and types (string,
 * number, boolean) which are stored in the global schema store.
 *
 * @returns The rendered schema editor panel with field input controls and field list
 */
export const SchemaEditor = (): React.JSX.Element => {
    const { fields, addField, removeField } = useSchemaStore();
    const [newFieldName, setNewFieldName] = useState('');
    const [newFieldType, setNewFieldType] = useState<MockField['type']>(SCHEMA_TYPES.STRING);

    /**
     * Handles adding a new field to the schema.
     * Validates that the field name is non-empty, adds the field to the store,
     * and resets the input field.
     */
    const handleAdd = () => {
        if (newFieldName.trim()) {
            addField({ name: newFieldName.trim(), type: newFieldType });
            setNewFieldName('');
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b border-slate-700 bg-slate-900/50">
                <h3 className={panelHeaderVariants()}>
                    <Database className="w-3 h-3" />
                    Schema Mocking
                </h3>
            </div>

            <div className="p-3 border-b border-slate-700">
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        placeholder="Field name"
                        className="flex-1 px-2 py-1 text-xs border rounded bg-slate-800 border-slate-700"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <select
                        value={newFieldType}
                        onChange={(e) => setNewFieldType(e.target.value as MockField['type'])}
                        className="px-2 py-1 text-xs border rounded bg-slate-800 border-slate-700"
                    >
                        <option value={SCHEMA_TYPES.STRING}>String</option>
                        <option value={SCHEMA_TYPES.NUMBER}>Number</option>
                        <option value={SCHEMA_TYPES.BOOLEAN}>Boolean</option>
                    </select>
                </div>
                <button
                    onClick={handleAdd}
                    disabled={!newFieldName.trim()}
                    className="w-full flex items-center justify-center gap-1 px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    <Plus className="w-3 h-3" />
                    Add Field
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {fields.map((field) => (
                    <div
                        key={field.id}
                        className="flex items-center justify-between p-2 rounded bg-slate-800/50 border border-slate-700/50"
                    >
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-300">
                                {field.name}
                            </span>
                            <span className="text-2xs uppercase text-slate-400 bg-slate-700 px-1 rounded">
                                {field.type}
                            </span>
                        </div>
                        <button
                            onClick={() => removeField(field.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                            aria-label="Remove field"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
