/**
 * SPLinter Feature Schemas
 *
 * Zod schemas and derived types for the SPLinter feature's data model.
 * 
 * @module features/splinter/model/splinter.schemas
 */

import { z } from 'zod';
import { SCHEMA_TYPES } from './constants/splinter.constants';

// Re-export LinterWarning from entities for backward compatibility
export {
  LinterWarningSchema,
  LinterSeveritySchema,
  type LinterWarning,
  type LinterSeverity,
} from '@/entities/spl';

export const SplAnalysisSchema = z.object({
  lineCount: z.number().min(0),
  commandCount: z.number().min(0),
  uniqueCommands: z.array(z.string()),
  commandToLines: z.map(z.string(), z.array(z.number())),
  fields: z.array(z.string()),
  fieldToLines: z.map(z.string(), z.array(z.number())),
  warnings: z.array(
    z.object({
      line: z.number().min(1),
      message: z.string(),
      severity: z.enum(['low', 'medium', 'high']),
      suggestion: z.string().optional(),
    })
  ),
});

export type SplAnalysis = z.infer<typeof SplAnalysisSchema>;

export const FoldRangeSchema = z.object({
  startLine: z.number().min(1),
  endLine: z.number().min(1),
  type: z.enum(['subsearch', 'macro', 'comment']),
});

export type FoldRange = z.infer<typeof FoldRangeSchema>;

export const MockFieldSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.enum([SCHEMA_TYPES.STRING, SCHEMA_TYPES.NUMBER, SCHEMA_TYPES.BOOLEAN]),
});

export type MockField = z.infer<typeof MockFieldSchema>;
