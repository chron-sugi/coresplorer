/**
 * SPL search helpers
 *
 * Token/AST-aware search used by Splinter to find commands, fields, and free text.
 * Leverages the parsed AST when available and falls back to line-based search.
 */
import type { ParseResult, Pipeline, Command, SearchExpression, FieldReference } from '@/entities/spl/lib/parser';

export type SearchKind = 'command' | 'field' | 'text';

export interface SearchResult {
    line: number;
    content: string;
    kind: SearchKind;
    match: string;
    score: number;
}

interface SearchFilters {
    commands: boolean;
    fields: boolean;
    text: boolean;
}

/**
 * Perform AST-aware search for commands/fields/text.
 * @param code - raw SPL text (for content snippets)
 * @param searchTerm - query string
 * @param parseResult - parser output (AST + tokens)
 * @param filters - which result kinds to include
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
                if ((stage as Command).type && (stage as Command).type.endsWith('Command')) {
                    const cmd = (stage as Command);
                    let name: string | null = null;
                    if (cmd.type === 'GenericCommand') {
                        name = cmd.commandName;
                    } else if (cmd.type === 'StatsCommand') {
                        name = cmd.variant;
                    } else {
                        name = cmd.type.replace('Command', '').toLowerCase();
                    }
                    if (name && filters.commands) {
                        const match = name.toLowerCase();
                        const score = computeScore(match, query);
                        if (score > 0) {
                            addResult(cmd.location.startLine, lines[cmd.location.startLine - 1] ?? '', 'command', name, score);
                        }
                    }
                    // Dive into subsearches
                    if (cmd.type === 'AppendCommand') {
                        collectCommands(cmd.subsearch);
                    }
                    if (cmd.type === 'JoinCommand') {
                        collectCommands(cmd.subsearch);
                    }
                    if (cmd.type === 'GenericCommand' && cmd.subsearches?.length) {
                        cmd.subsearches.forEach(collectCommands);
                    }
                } else if ((stage as SearchExpression).type === 'SearchExpression') {
                    // Treat base search as a "search" command for results
                    const se = stage as SearchExpression;
                    if (filters.commands) {
                        const score = computeScore('search', query);
                        if (score > 0) {
                            addResult(se.location.startLine, lines[se.location.startLine - 1] ?? '', 'command', 'search', score);
                        }
                    }
                }
            });
        };

        const collectFields = (pipe: Pipeline) => {
            pipe.stages.forEach((stage) => {
                if ((stage as Command).type && (stage as Command).type.endsWith('Command')) {
                    const cmd = stage as Command;
                    const fieldRefs: string[] = [];
                    switch (cmd.type) {
                        case 'EvalCommand':
                            cmd.assignments.forEach((a) => {
                                fieldRefs.push(a.targetField);
                                fieldRefs.push(...a.dependsOn);
                            });
                            break;
                        case 'StatsCommand':
                            cmd.aggregations.forEach((agg) => {
                                if (agg.outputField) fieldRefs.push(agg.outputField);
                                if (agg.field) fieldRefs.push(agg.field.fieldName);
                            });
                            cmd.byFields.forEach((f) => fieldRefs.push(f.fieldName));
                            break;
                        case 'RenameCommand':
                            cmd.renamings.forEach((r) => {
                                fieldRefs.push(r.oldField.fieldName, r.newField.fieldName);
                            });
                            break;
                        case 'RexCommand':
                            if (cmd.sourceField) fieldRefs.push(cmd.sourceField);
                            cmd.extractedFields.forEach((f) => fieldRefs.push(f));
                            break;
                        case 'LookupCommand':
                            cmd.inputMappings.forEach((m) => fieldRefs.push(m.eventField));
                            cmd.outputMappings.forEach((m) => fieldRefs.push(m.eventField));
                            break;
                        case 'FieldsCommand':
                        case 'TableCommand':
                            cmd.fields.forEach((f: FieldReference) => fieldRefs.push(f.fieldName));
                            break;
                        case 'DedupCommand':
                            cmd.fields.forEach((f) => fieldRefs.push(f.fieldName));
                            break;
                        case 'WhereCommand':
                            fieldRefs.push(...cmd.referencedFields);
                            break;
                        case 'MvexpandCommand':
                        case 'BinCommand':
                            if (cmd.field) {
                                fieldRefs.push(cmd.field);
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
                            addResult(cmd.location.startLine, lines[cmd.location.startLine - 1] ?? '', 'field', field, score);
                        }
                    });

                    // Traverse subsearches
                    if (cmd.type === 'AppendCommand') collectFields(cmd.subsearch);
                    if (cmd.type === 'JoinCommand') collectFields(cmd.subsearch);
                    if (cmd.type === 'GenericCommand' && cmd.subsearches?.length) {
                        cmd.subsearches.forEach(collectFields);
                    }
                } else if ((stage as SearchExpression).type === 'SearchExpression') {
                    const se = stage as SearchExpression;
                    // Extract fields from comparisons
                    se.referencedFields.forEach((f) => {
                        if (!filters.fields) return;
                        const score = computeScore(f.toLowerCase(), query);
                        if (score > 0) {
                            addResult(se.location.startLine, lines[se.location.startLine - 1] ?? '', 'field', f.toLowerCase(), score);
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

function computeScore(target: string, query: string, loose = false): number {
    if (!target) return 0;
    if (target === query) return 3;
    if (target.startsWith(query)) return 2;
    if (!loose && target.includes(query)) return 1.5;
    if (loose && target.includes(query)) return 1;
    return 0;
}
