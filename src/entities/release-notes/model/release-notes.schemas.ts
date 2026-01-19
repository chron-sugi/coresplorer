/**
 * Release Notes Zod Schemas
 *
 * Runtime validation schemas for the release_notes.json API response.
 *
 * @module entities/release-notes/model/release-notes.schemas
 */
import { z } from 'zod';

/**
 * Schema for a single release entry.
 */
export const ReleaseEntrySchema = z.object({
  version: z.string(),
  date: z.string(),
  notes: z.array(z.string()),
});

/**
 * Schema for the full release_notes.json response.
 * Array of release entries.
 */
export const ReleaseNotesSchema = z.array(ReleaseEntrySchema);

// Inferred types from schemas
export type ReleaseEntry = z.infer<typeof ReleaseEntrySchema>;
export type ReleaseNotes = z.infer<typeof ReleaseNotesSchema>;
