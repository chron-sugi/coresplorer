/**
 * Field Tracker
 * 
 * Maintains state of all fields as we walk through the pipeline.
 * 
 * @module features/field-lineage/lib/field-tracker
 */

import type {
  FieldLineage,
  FieldEvent,
  FieldState,
  FieldDataType,
  ConfidenceLevel,
} from '../model/field-lineage.types';

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

  /**
   * Add or create a field.
   */
  addField(
    fieldName: string,
    event: FieldEvent,
    options: FieldCreationOptions = {}
  ): void {
    const existing = this.fields.get(fieldName);

    if (existing) {
      // Field already exists - this is a modification
      existing.events.push(event);
      if (event.dependsOn) {
        existing.dependsOn = [...new Set([...existing.dependsOn, ...event.dependsOn])];
        this.updateDependencyGraph(fieldName, event.dependsOn);
      }
    } else {
      // New field
      const lineage: FieldLineage = {
        fieldName,
        events: [event],
        origin: event,
        dependsOn: event.dependsOn || [],
        dependedOnBy: [],
        dataType: options.dataType || 'unknown',
        isMultivalue: options.isMultivalue || false,
        confidence: options.confidence || 'certain',
      };
      this.fields.set(fieldName, lineage);

      if (event.dependsOn) {
        this.updateDependencyGraph(fieldName, event.dependsOn);
      }
    }

    // Update current state
    this.currentState.set(fieldName, {
      fieldName,
      exists: true,
      lastEvent: event,
      dataType: options.dataType || 'unknown',
      isMultivalue: options.isMultivalue || false,
      confidence: options.confidence || 'certain',
    });
  }

  /**
   * Modify an existing field.
   */
  modifyField(fieldName: string, event: FieldEvent): void {
    const existing = this.fields.get(fieldName);

    if (existing) {
      existing.events.push(event);
      if (event.dependsOn) {
        existing.dependsOn = [...new Set([...existing.dependsOn, ...event.dependsOn])];
        this.updateDependencyGraph(fieldName, event.dependsOn);
      }
    } else {
      // Field doesn't exist yet - create it
      this.addField(fieldName, { ...event, kind: 'created' });
      return;
    }

    // Update current state
    const state = this.currentState.get(fieldName);
    if (state) {
      state.lastEvent = event;
    }
  }

  /**
   * Record that a field was consumed (read).
   */
  consumeField(fieldName: string, event: FieldEvent): void {
    const existing = this.fields.get(fieldName);

    if (existing) {
      existing.events.push(event);
    } else {
      // Backfill missing fields as implicit origins so dependencies can be tracked
      this.addField(fieldName, {
        kind: 'origin',
        line: 1,
        column: 1,
        command: 'implicit',
        details: 'Inferred dependency',
      });
      const created = this.fields.get(fieldName);
      created?.events.push(event);
    }
  }

  /**
   * Drop a field (it no longer exists).
   */
  dropField(fieldName: string, event: FieldEvent): void {
    const existing = this.fields.get(fieldName);

    if (existing) {
      existing.events.push(event);
    }

    // Mark as not existing in current state
    const state = this.currentState.get(fieldName);
    if (state) {
      state.exists = false;
      state.lastEvent = event;
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
    return new Map(this.currentState);
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
}
