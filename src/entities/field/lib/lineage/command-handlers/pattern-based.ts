/**
 * Pattern-Based Command Handler
 *
 * Generic handler that uses the pattern interpreter to extract field lineage
 * from commands that have patterns defined in the registry.
 *
 * @module entities/field/lib/lineage/command-handlers/pattern-based
 */

import type { PipelineStage } from '@/entities/spl';
import { getCommandPattern, interpretPattern } from '@/entities/spl';
import type { CommandFieldEffect } from '../../../model/lineage.types';
import type { FieldTracker } from '../field-tracker';

// =============================================================================
// PATTERN-BASED HANDLER
// =============================================================================

/**
 * Handle a command using its pattern definition
 *
 * This is a generic handler that works for any command with a pattern.
 * It uses the pattern interpreter to extract field effects.
 *
 * @param stage - The pipeline stage to handle
 * @param _tracker - Field tracker (not used by pattern-based handler)
 * @returns Field effects extracted from the pattern
 */
export function handlePatternBasedCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  // Get command name from stage type
  const commandName = getCommandNameFromStage(stage);

  // Look up pattern for this command
  const pattern = getCommandPattern(commandName);

  if (!pattern) {
    // No pattern defined - return empty effects
    return {
      creates: [],
      modifies: [],
      consumes: [],
      drops: [],
    };
  }

  // Interpret the pattern against the AST node
  // Cast stage to satisfy interpreter's type - they're structurally compatible
  const result = interpretPattern(pattern, stage as unknown as Parameters<typeof interpretPattern>[1]);

  // Pure pattern: Convert pattern result to CommandFieldEffect format
  const effect: CommandFieldEffect = {
    // Creates: pattern's creates with dependencies
    creates: result.matched
      ? result.creates.map(field => ({
          fieldName: field.fieldName,
          dependsOn: field.dependsOn || [],
          expression: undefined,
          confidence: 'certain' as const,
        }))
      : [],

    // Modifies: convert FieldWithDependencies to FieldModification format
    modifies: result.matched
      ? result.modifies.map(f => ({
          fieldName: f.fieldName,
          dependsOn: f.dependsOn || [],
        }))
      : [],

    // Consumes: pattern's consumes + groups-by fields
    consumes: result.matched ? [...result.consumes, ...result.groupsBy] : [],

    // Drops: pattern's drops become drop objects
    drops: result.matched
      ? result.drops.map(fieldName => ({
          fieldName,
          reason: 'explicit' as const,
        }))
      : [],
  };

  // Apply command-level semantic rules (even if pattern didn't fully match)
  const semantics = result.semantics || pattern.semantics;
  if (semantics) {
    // staticCreates: Add static field creations from semantics
    if (semantics.staticCreates) {
      for (const staticField of semantics.staticCreates) {
        // Resolve dependencies from param values if needed
        const resolvedDeps = staticField.dependsOn?.map(dep => {
          // If dep is a param name, try to get actual field from consumes
          // For now, just use direct field references
          return dep;
        }) || [];

        effect.creates.push({
          fieldName: staticField.fieldName,
          dependsOn: resolvedDeps,
          expression: undefined,
          confidence: 'certain' as const,
        });
      }
    }

    // dropsAllExcept: Compute which fields to preserve
    if (semantics.dropsAllExcept) {
      const survivingFields: string[] = [];

      for (const category of semantics.dropsAllExcept) {
        if (category === 'byFields') {
          // Preserve grouping fields
          survivingFields.push(...result.groupsBy);
        } else if (category === 'creates') {
          // Preserve newly created fields
          survivingFields.push(...effect.creates.map(f => f.fieldName));
        }
      }

      // Set dropsAllExcept on the effect
      effect.dropsAllExcept = survivingFields;
    }

    // preservesAll: Set flag to preserve all pipeline fields
    if (semantics.preservesAll) {
      effect.preservesAll = true;
    }
  }

  return effect;
}

/**
 * Check if a command has a pattern defined
 *
 * @param stage - The pipeline stage to check
 * @returns true if a pattern exists for this command
 */
export function hasCommandPattern(stage: PipelineStage): boolean {
  const commandName = getCommandNameFromStage(stage);
  const pattern = getCommandPattern(commandName);
  return pattern !== undefined;
}

/**
 * Get command name from pipeline stage
 */
function getCommandNameFromStage(stage: PipelineStage): string {
  if (stage.type === 'SearchExpression') {
    return 'search';
  }
  return stage.type.replace('Command', '').toLowerCase();
}
