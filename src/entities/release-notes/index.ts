/**
 * Release Notes Entity
 *
 * @module entities/release-notes
 */

// API hooks
export { useReleaseNotesQuery, releaseNotesQueryKeys } from './api';

// Model types and schemas
export {
  ReleaseEntrySchema,
  ReleaseNotesSchema,
} from './model';

export type { ReleaseEntry, ReleaseNotes } from './model';
