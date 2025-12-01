/**
 * SPL Store Index
 *
 * Re-exports all SPL entity stores.
 *
 * @module entities/spl/store
 */
export {
  useEditorStore,
  selectSplText,
  selectParseResult,
  selectAST,
  selectIsParsing,
  selectParseError,
  selectCursor,
} from './editor-store';
