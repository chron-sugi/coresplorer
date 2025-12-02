/**
 * Pattern-Based Command Handler
 *
 * Generic handler that uses the pattern interpreter to extract field lineage
 * from commands that have patterns defined in the registry.
 *
 * @module features/field-lineage/lib/command-handlers/pattern-based
 */

import type { PipelineStage, PatternMatchResult } from '@/entities/spl';
import { getCommandPattern, interpretPattern } from '@/entities/spl';
import type { CommandFieldEffect } from '../../model/field-lineage.types';
import type { FieldTracker } from '../field-tracker';

// =============================================================================
// AUGMENTATION HANDLER TYPE
// =============================================================================

/**
 * Augmentation handler signature
 *
 * Receives pattern match results and enriches them with additional metadata
 * (type inference, expressions, per-field locations, etc.)
 *
 * Used for hybrid pattern + custom handler commands like stats.
 *
 * @param patternResult - Result from pattern interpreter
 * @param stage - Original AST node
 * @param tracker - Field tracker for context
 * @returns Enriched field effect with custom metadata
 */
export type AugmentationHandler = (
  patternResult: PatternMatchResult,
  stage: PipelineStage,
  tracker: FieldTracker
) => CommandFieldEffect;

// =============================================================================
// AUGMENTATION REGISTRY
// =============================================================================

/**
 * Registry of commands that augment pattern results with custom handlers
 *
 * These commands use patterns for syntax validation and semantic rules,
 * but add custom logic for rich metadata (types, expressions, locations).
 */
const AUGMENTATION_HANDLERS: Record<string, AugmentationHandler> = {
  // Stats variants will be registered here
  // Note: Import handlers lazily to avoid circular dependencies
};

/**
 * Register an augmentation handler for a command
 *
 * @param commandName - Name of the command
 * @param handler - Augmentation handler function
 */
export function registerAugmentationHandler(
  commandName: string,
  handler: AugmentationHandler
): void {
  AUGMENTATION_HANDLERS[commandName] = handler;
}

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
    console.warn(`[PatternHandler] No pattern found for command: ${commandName}`);
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

  // Check for augmentation handler first (hybrid pattern + custom approach)
  // Augmentation handlers can work even if pattern matching fails,
  // as they use the AST directly rather than relying on pattern extraction
  const augmentationHandler = AUGMENTATION_HANDLERS[commandName];
  if (augmentationHandler) {
    // Hybrid: Use custom handler to augment pattern results
    // Pass result even if not matched - handler can use AST directly
    return augmentationHandler(result, stage, _tracker);
  }

  if (!result.matched) {
    console.warn(`[PatternHandler] Pattern match failed for ${commandName}:`, result.error);
    return {
      creates: [],
      modifies: [],
      consumes: [],
      drops: [],
    };
  }

  // Pure pattern: Convert pattern result to CommandFieldEffect format
  const effect: CommandFieldEffect = {
    // Creates: pattern's creates with dependencies
    creates: result.creates.map(field => ({
      fieldName: field.fieldName,
      dependsOn: field.dependsOn || [], // ✅ Use dependencies from pattern
      expression: undefined,
      confidence: 'certain' as const,
    })),

    // Modifies: convert FieldWithDependencies to FieldModification format
    modifies: result.modifies.map(f => ({
      fieldName: f.fieldName,
      dependsOn: f.dependsOn || [],
    })),

    // Consumes: pattern's consumes + groups-by fields
    consumes: [...result.consumes, ...result.groupsBy],

    // Drops: pattern's drops become drop objects
    drops: result.drops.map(fieldName => ({
      fieldName,
      reason: 'explicit' as const,
    })),
  };

  // Apply command-level semantic rules
  if (result.semantics) {
    // dropsAllExcept: Compute which fields to preserve
    if (result.semantics.dropsAllExcept) {
      const survivingFields: string[] = [];

      for (const category of result.semantics.dropsAllExcept) {
        if (category === 'byFields') {
          // Preserve grouping fields
          survivingFields.push(...result.groupsBy);
        } else if (category === 'creates') {
          // Preserve newly created fields
          survivingFields.push(...result.creates.map(f => f.fieldName));
        }
      }

      // Set dropsAllExcept on the effect
      effect.dropsAllExcept = survivingFields;
    }

    // preservesAll: Set flag to preserve all pipeline fields
    if (result.semantics.preservesAll) {
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
