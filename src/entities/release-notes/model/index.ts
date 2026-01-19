/**
 * Release Notes Model Index
 *
 * @module entities/release-notes/model
 */

// Zod schemas for API validation
export {
  ReleaseEntrySchema,
  ReleaseNotesSchema,
} from './release-notes.schemas';

export type { ReleaseEntry, ReleaseNotes } from './release-notes.schemas';
