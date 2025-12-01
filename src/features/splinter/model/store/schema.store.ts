/**
 * Schema Mock Store
 * 
 * Zustand store for managing schema mocking state.
 * 
 * @module features/splinter/model/store/schema.store
 */

import { create } from 'zustand';
import { SCHEMA_TYPES } from '../constants/splinter.constants';
import type { MockField } from '../splinter.schemas';

interface SchemaState {
  fields: MockField[];
  addField: (field: Omit<MockField, 'id'>) => void;
  removeField: (id: string) => void;
}

export const useSchemaStore = create<SchemaState>((set) => ({
  fields: [
    { id: '1', name: 'host', type: SCHEMA_TYPES.STRING },
    { id: '2', name: 'status', type: SCHEMA_TYPES.NUMBER },
    { id: '3', name: 'action', type: SCHEMA_TYPES.STRING }
  ],
  addField: (field) => set((state) => ({ 
    fields: [...state.fields, { ...field, id: Math.random().toString(36).substr(2, 9) }] 
  })),
  removeField: (id) => set((state) => ({ 
    fields: state.fields.filter(f => f.id !== id) 
  })),
}));
