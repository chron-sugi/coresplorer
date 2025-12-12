/**
 * Mixin Type Helpers
 *
 * Type utilities for creating composable transformer mixins.
 * Enables TypeScript to track mixin composition while maintaining type safety.
 *
 * @module entities/spl/lib/parser/ast/visitors/mixin-types
 */

import type { BaseTransformer } from '../base-transformer';

/**
 * Constructor type for any class.
 *
 * Used as a constraint for mixin base classes. Allows mixins to extend
 * any class while preserving its constructor signature.
 *
 * @example
 * ```typescript
 * function MyMixin<T extends Constructor>(Base: T) {
 *   return class extends Base { ... }
 * }
 * ```
 */
export type Constructor<T = object> = new (...args: any[]) => T;

/**
 * Transformer mixin function type.
 *
 * Defines the signature for mixin functions that extend BaseTransformer.
 * Each mixin takes a base class and returns an extended class with additional methods.
 *
 * @template T - The interface of methods added by this mixin
 * @param Base - The base class to extend (must extend BaseTransformer)
 * @returns A new class that extends Base with additional functionality
 *
 * @example
 * ```typescript
 * export const FieldCreatorsMixin: TransformerMixin = <TBase extends Constructor<BaseTransformer>>(
 *   Base: TBase
 * ) =>
 *   class extends Base {
 *     protected visitEvalCommand(ctx: any): AST.EvalCommand { ... }
 *   };
 * ```
 */
export type TransformerMixin<T = object> = <TBase extends Constructor<BaseTransformer>>(
  Base: TBase
) => Constructor<T> & TBase;
