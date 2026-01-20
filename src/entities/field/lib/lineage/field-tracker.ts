/**
 * Field Tracker
 *
 * Maintains state of all fields as we walk through the pipeline.
 *
 * @module entities/field/lib/lineage/field-tracker
 */

import type {
  FieldLineage,
  FieldEvent,
  FieldState,
  FieldDataType,
  ConfidenceLevel,
  ScopeContext,
} from '../../model/lineage.types';
import { createRootScope } from './scope-utils';

interface FieldCreationOptions {
  dataType?: FieldDataType;
  isMultivalue?: boolean;
  confidence?: ConfidenceLevel;
}

/**
 * Tracks field state through pipeline analysis.
 */
export class FieldTracker {
  private fields: Map<string, FieldLineage> = new Map();
  private currentState: Map<string, FieldState> = new Map();
  private dependencyGraph: Map<string, Set<string>> = new Map();
  private sourceLines: string[];
  private currentScope: ScopeContext;

  constructor(sourceLines: string[] = [], scope?: ScopeContext) {
    this.sourceLines = sourceLines;
    this.currentScope = scope ?? createRootScope();
  }

  /**
   * Get the current scope context.
   */
  getScope(): ScopeContext {
    return this.currentScope;
  }

  /**
   * Get the current scope ID.
   */
  getScopeId(): string {
    return this.currentScope.id;
  }

  getSourceLine(line: number): string | null {
    return this.sourceLines[line - 1] ?? null;
  }

  /**
   * Add or create a field.
   */
  addField(
    fieldName: string,
    event: FieldEvent,
    options: FieldCreationOptions = {}
  ): void {
    // Ensure event has the current scope ID
    const eventWithScope: FieldEvent = {
      ...event,
      scopeId: event.scopeId ?? this.currentScope.id,
    };

    const existing = this.fields.get(fieldName);

    if (existing) {
      // Field already exists - this is a modification
      existing.events.push(eventWithScope);
      if (eventWithScope.dependsOn) {
        existing.dependsOn = [...new Set([...existing.dependsOn, ...eventWithScope.dependsOn])];
        this.updateDependencyGraph(fieldName, eventWithScope.dependsOn);
      }
    } else {
      // New field
      const lineage: FieldLineage = {
        fieldName,
        events: [eventWithScope],
        origin: eventWithScope,
        dependsOn: eventWithScope.dependsOn || [],
        dependedOnBy: [],
        dataType: options.dataType || 'unknown',
        isMultivalue: options.isMultivalue || false,
        confidence: options.confidence || 'certain',
      };
      this.fields.set(fieldName, lineage);

      if (eventWithScope.dependsOn) {
        this.updateDependencyGraph(fieldName, eventWithScope.dependsOn);
      }
    }

    // Update current state
    this.currentState.set(fieldName, {
      fieldName,
      exists: true,
      lastEvent: eventWithScope,
      dataType: options.dataType || 'unknown',
      isMultivalue: options.isMultivalue || false,
      confidence: options.confidence || 'certain',
    });
  }

  /**
   * Modify an existing field.
   */
  modifyField(fieldName: string, event: FieldEvent): void {
    // Ensure event has the current scope ID
    const eventWithScope: FieldEvent = {
      ...event,
      scopeId: event.scopeId ?? this.currentScope.id,
    };

    const existing = this.fields.get(fieldName);

    if (existing) {
      existing.events.push(eventWithScope);
      if (eventWithScope.dependsOn) {
        existing.dependsOn = [...new Set([...existing.dependsOn, ...eventWithScope.dependsOn])];
        this.updateDependencyGraph(fieldName, eventWithScope.dependsOn);
      }
    } else {
      // Field doesn't exist yet - create it
      this.addField(fieldName, { ...eventWithScope, kind: 'created' });
      return;
    }

    // Update current state
    const state = this.currentState.get(fieldName);
    if (state) {
      state.lastEvent = eventWithScope;
    }
  }

  /**
   * Record that a field was consumed (read).
   */
  consumeField(fieldName: string, event: FieldEvent): void {
    // Ensure event has the current scope ID
    const eventWithScope: FieldEvent = {
      ...event,
      scopeId: event.scopeId ?? this.currentScope.id,
    };

    const existing = this.fields.get(fieldName);

    if (existing) {
      existing.events.push(eventWithScope);
    } else {
      // Backfill missing fields as implicit origins so dependencies can be tracked
      // Use the event's location (where we first saw the field) not line 1
      this.addField(fieldName, {
        kind: 'origin',
        line: eventWithScope.line,
        column: eventWithScope.column,
        command: 'implicit',
        details: 'Inferred dependency',
        scopeId: this.currentScope.id,
      });
      const created = this.fields.get(fieldName);
      created?.events.push(eventWithScope);
    }
  }

  /**
   * Drop a field (it no longer exists in the current scope).
   */
  dropField(fieldName: string, event: FieldEvent): void {
    // Ensure event has the current scope ID
    const eventWithScope: FieldEvent = {
      ...event,
      scopeId: event.scopeId ?? this.currentScope.id,
    };

    let existing = this.fields.get(fieldName);

    if (!existing) {
      // Backfill missing fields as implicit origins so drop events can be tracked
      // Use the event's location (where we first saw the field)
      this.addField(fieldName, {
        kind: 'origin',
        line: eventWithScope.line,
        column: eventWithScope.column,
        command: 'implicit',
        details: 'Inferred dependency',
        scopeId: this.currentScope.id,
      });
      existing = this.fields.get(fieldName);
    }

    if (existing) {
      existing.events.push(eventWithScope);
    }

    // Mark as not existing in current state
    // Note: In subsearch scopes, this only affects the subsearch's view of the field
    const state = this.currentState.get(fieldName);
    if (state) {
      state.exists = false;
      state.lastEvent = eventWithScope;
    }
  }

  /**
   * Check if a field currently exists.
   */
  fieldExists(fieldName: string): boolean {
    const state = this.currentState.get(fieldName);
    return state?.exists ?? false;
  }

  /**
   * Get lineage for a field.
   */
  getFieldLineage(fieldName: string): FieldLineage | null {
    return this.fields.get(fieldName) || null;
  }

  /**
   * Get current state of all fields.
   */
  getFieldStates(): Map<string, FieldState> {
    return new Map(
      Array.from(this.currentState.entries()).map(([name, state]) => [
        name,
        { ...state },
      ])
    );
  }

  /**
   * Get all known field names.
   */
  getAllFields(): string[] {
    return Array.from(this.fields.keys());
  }

  /**
   * Get all fields that currently exist.
   */
  getExistingFields(): string[] {
    return Array.from(this.currentState.entries())
      .filter(([_, state]) => state.exists)
      .map(([name, _]) => name);
  }

  /**
   * Update the dependency graph.
   */
  private updateDependencyGraph(field: string, dependsOn: string[]): void {
    for (const dep of dependsOn) {
      // field depends on dep
      // So dep is depended on by field
      if (!this.fields.has(dep)) {
        this.addField(dep, {
          kind: 'origin',
          line: 1,
          column: 1,
          command: 'implicit',
          details: 'Inferred dependency',
          scopeId: this.currentScope.id,
        });
      }
      const depLineage = this.fields.get(dep);
      if (depLineage && !depLineage.dependedOnBy.includes(field)) {
        depLineage.dependedOnBy.push(field);
      }

      // Update graph
      if (!this.dependencyGraph.has(dep)) {
        this.dependencyGraph.set(dep, new Set());
      }
      this.dependencyGraph.get(dep)!.add(field);
    }
  }

  /**
   * Reset field existence (for commands that drop all fields).
   */
  dropAllFieldsExcept(keepFields: string[]): void {
    const keepSet = new Set(keepFields);

    for (const [fieldName, state] of this.currentState) {
      if (!keepSet.has(fieldName)) {
        state.exists = false;
      }
    }
  }

  /**
   * Get events for a field filtered by scope.
   */
  getFieldEventsInScope(fieldName: string, scopeId: string): FieldEvent[] {
    const lineage = this.fields.get(fieldName);
    if (!lineage) return [];
    return lineage.events.filter(e => e.scopeId === scopeId);
  }

  /**
   * Check if a field has any events in a specific scope.
   */
  fieldHasEventsInScope(fieldName: string, scopeId: string): boolean {
    return this.getFieldEventsInScope(fieldName, scopeId).length > 0;
  }
}
