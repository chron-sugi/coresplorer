/**
 * SPL Search Helpers
 *
 * Token/AST-aware search used by SPLinter to find commands, fields, and free text.
 * Leverages the parsed AST when available and falls back to line-based search.
 *
 * @module features/splinter/lib/spl/searchSpl
 */

import type { ParseResult, Pipeline, Command, SearchExpression, FieldReference, PipelineStage } from '@/entities/spl';

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if a pipeline stage is a Command node.
 * Commands have a `type` property that ends with 'Command'.
 */
function isCommand(stage: PipelineStage): stage is Command {
    return typeof stage.type === 'string' && stage.type.endsWith('Command');
}

/**
 * Type guard to check if a pipeline stage is a SearchExpression node.
 */
function isSearchExpression(stage: PipelineStage): stage is SearchExpression {
    return stage.type === 'SearchExpression';
}

// =============================================================================
// TYPES
// =============================================================================

/** Type of search result: command name, field name, or free text */
export type SearchKind = 'command' | 'field' | 'text';

/**
 * A search result from SPL code search.
 */
export interface SearchResult {
    /** Line number where the match was found (1-based) */
    line: number;
    /** The full content of the line containing the match */
    content: string;
    /** Type of match: command, field, or text */
    kind: SearchKind;
    /** The matched string */
    match: string;
    /** Relevance score (higher is better): 3=exact, 2=prefix, 1.5=contains, 1=loose */
    score: number;
}

/**
 * Filters to control which result types are included.
 */
interface SearchFilters {
    /** Include command name matches */
    commands: boolean;
    /** Include field name matches */
    fields: boolean;
    /** Include free text matches */
    text: boolean;
}

/**
 * Perform AST-aware search for commands, fields, and free text in SPL code.
 *
 * When a parsed AST is available, extracts commands and fields from the AST
 * for precise matching. Falls back to line-based text search when AST is unavailable.
 * Results are ranked by relevance score and sorted by score (desc) then line (asc).
 *
 * @param code - Raw SPL text (used for content snippets and fallback search)
 * @param searchTerm - Query string to search for
 * @param parseResult - Parser output containing AST and tokens (can be null)
 * @param filters - Which result kinds to include (defaults to all)
 * @returns Array of search results sorted by relevance score
 *
 * @example
 * ```typescript
 * const results = searchSpl(
 *   'index=main | stats count BY host',
 *   'host',
 *   parseResult,
 *   { commands: true, fields: true, text: false }
 * );
 * // Returns: [{ line: 1, kind: 'field', match: 'host', score: 3, ... }]
 * ```
 */
export function searchSpl(
    code: string,
    searchTerm: string,
    parseResult: ParseResult | null,
    filters: SearchFilters = { commands: true, fields: true, text: true },
): SearchResult[] {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return [];

    const lines = code.split('\n');

    const results: SearchResult[] = [];

    const addResult = (line: number, content: string, kind: SearchKind, match: string, score: number) => {
        if (line < 1) return;
        results.push({
            line,
            content: content.trim(),
            kind,
            match,
            score,
        });
    };

    // AST-driven extraction
    if (parseResult?.ast) {
        const pipeline = parseResult.ast;
        const collectCommands = (pipe: Pipeline) => {
            pipe.stages.forEach((stage) => {
                if (isCommand(stage)) {
                    let name: string | null = null;
                    if (stage.type === 'GenericCommand') {
                        name = stage.commandName;
                    } else if (stage.type === 'StatsCommand') {
                        name = stage.variant;
                    } else {
                        name = stage.type.replace('Command', '').toLowerCase();
                    }
                    if (name && filters.commands) {
                        const match = name.toLowerCase();
                        const score = computeScore(match, query);
                        if (score > 0) {
                            addResult(stage.location.startLine, lines[stage.location.startLine - 1] ?? '', 'command', name, score);
                        }
                    }
                    // Dive into subsearches
                    if (stage.type === 'AppendCommand') {
                        collectCommands(stage.subsearch);
                    }
                    if (stage.type === 'JoinCommand') {
                        collectCommands(stage.subsearch);
                    }
                    if (stage.type === 'GenericCommand' && stage.subsearches?.length) {
                        stage.subsearches.forEach(collectCommands);
                    }
                } else if (isSearchExpression(stage)) {
                    // Treat base search as a "search" command for results
                    if (filters.commands) {
                        const score = computeScore('search', query);
                        if (score > 0) {
                            addResult(stage.location.startLine, lines[stage.location.startLine - 1] ?? '', 'command', 'search', score);
                        }
                    }
                }
            });
        };

        const collectFields = (pipe: Pipeline) => {
            pipe.stages.forEach((stage) => {
                if (isCommand(stage)) {
                    const fieldRefs: string[] = [];
                    switch (stage.type) {
                        case 'EvalCommand':
                            stage.assignments.forEach((a) => {
                                fieldRefs.push(a.targetField);
                                fieldRefs.push(...a.dependsOn);
                            });
                            break;
                        case 'StatsCommand':
                            stage.aggregations.forEach((agg) => {
                                if (agg.outputField) fieldRefs.push(agg.outputField);
                                if (agg.field) fieldRefs.push(agg.field.fieldName);
                            });
                            stage.byFields.forEach((f) => fieldRefs.push(f.fieldName));
                            break;
                        case 'RenameCommand':
                            stage.renamings.forEach((r) => {
                                fieldRefs.push(r.oldField.fieldName, r.newField.fieldName);
                            });
                            break;
                        case 'RexCommand':
                            if (stage.sourceField) fieldRefs.push(stage.sourceField);
                            stage.extractedFields.forEach((f) => fieldRefs.push(f));
                            break;
                        case 'LookupCommand':
                            stage.inputMappings.forEach((m) => fieldRefs.push(m.eventField));
                            stage.outputMappings.forEach((m) => fieldRefs.push(m.eventField));
                            break;
                        case 'FieldsCommand':
                        case 'TableCommand':
                            stage.fields.forEach((f: FieldReference) => fieldRefs.push(f.fieldName));
                            break;
                        case 'DedupCommand':
                            stage.fields.forEach((f) => fieldRefs.push(f.fieldName));
                            break;
                        case 'WhereCommand':
                            fieldRefs.push(...stage.referencedFields);
                            break;
                        case 'MvexpandCommand':
                        case 'BinCommand':
                            if (stage.field) {
                                fieldRefs.push(stage.field);
                            }
                            break;
                        default:
                            break;
                    }
                    const unique = Array.from(new Set(fieldRefs.map((f) => f.toLowerCase()))).filter(Boolean);
                    unique.forEach((field) => {
                        if (!filters.fields) return;
                        const score = computeScore(field, query);
                        if (score > 0) {
                            addResult(stage.location.startLine, lines[stage.location.startLine - 1] ?? '', 'field', field, score);
                        }
                    });

                    // Traverse subsearches
                    if (stage.type === 'AppendCommand') collectFields(stage.subsearch);
                    if (stage.type === 'JoinCommand') collectFields(stage.subsearch);
                    if (stage.type === 'GenericCommand' && stage.subsearches?.length) {
                        stage.subsearches.forEach(collectFields);
                    }
                } else if (isSearchExpression(stage)) {
                    // Extract fields from comparisons
                    stage.referencedFields.forEach((f) => {
                        if (!filters.fields) return;
                        const score = computeScore(f.toLowerCase(), query);
                        if (score > 0) {
                            addResult(stage.location.startLine, lines[stage.location.startLine - 1] ?? '', 'field', f.toLowerCase(), score);
                        }
                    });
                }
            });
        };

        collectCommands(pipeline);
        collectFields(pipeline);
    }

    // Fallback / free-text search
    if (filters.text) {
        lines.forEach((line, index) => {
            const score = computeScore(line.toLowerCase(), query, true);
            if (score > 0) {
                addResult(index + 1, line, 'text', searchTerm, score);
            }
        });
    }

    // Sort by score (desc) then line asc
    results.sort((a, b) => b.score - a.score || a.line - b.line);
    return results;
}

/**
 * Compute relevance score for a search match.
 *
 * @param target - The string to search within
 * @param query - The search query
 * @param loose - If true, use lower score for substring matches (for text search)
 * @returns Score: 3=exact match, 2=prefix match, 1.5=contains (strict), 1=contains (loose), 0=no match
 */
function computeScore(target: string, query: string, loose = false): number {
    if (!target) return 0;
    if (target === query) return 3;
    if (target.startsWith(query)) return 2;
    if (!loose && target.includes(query)) return 1.5;
    if (loose && target.includes(query)) return 1;
    return 0;
}
