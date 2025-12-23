/**
 * AST Extraction Utilities
 *
 * Extracts command and field mappings from a parsed SPL AST.
 * Used by SPLinter for statistics and analysis.
 *
 * @module features/splinter/lib/spl/extractFromAst
 */

import type {
    Pipeline,
    PipelineStage,
    Command,
    SearchExpression,
} from '@/entities/spl';

/** Map of command names to their line numbers */
type CommandMap = Map<string, number[]>;

/** Map of field names to their line numbers */
type FieldMap = Map<string, number[]>;

/**
 * Result of extracting commands and fields from an AST.
 */
export interface ExtractionResult {
    /** Map of command names (lowercase) to line numbers where they appear */
    commandToLines: CommandMap;
    /** Map of field names (lowercase) to line numbers where they appear */
    fieldToLines: FieldMap;
    /** Total count of commands in the pipeline (including subsearches) */
    commandCount: number;
}

const addToMap = (map: Map<string, number[]>, key: string, line: number) => {
    if (!key) return;
    const normalized = key.toLowerCase();
    if (!map.has(normalized)) {
        map.set(normalized, []);
    }
    const arr = map.get(normalized)!;
    if (!arr.includes(line)) {
        arr.push(line);
    }
};

const recordFields = (names: string[], line: number, fieldMap: FieldMap) => {
    names
        .map((n) => n.toLowerCase())
        .filter(Boolean)
        .forEach((name) => addToMap(fieldMap, name, line));
};

function handleCommand(
    cmd: Command,
    commandMap: CommandMap,
    fieldMap: FieldMap,
    baseFields: Set<string>,
): number {
    let commandCount = 1;
    const line = cmd.location.startLine;

    const recordCommand = (name: string | null) => {
        if (!name) return;
        addToMap(commandMap, name, line);
    };

    switch (cmd.type) {
        case 'GenericCommand':
            recordCommand(cmd.commandName);
            if (cmd.subsearches?.length) {
                cmd.subsearches.forEach((sub) => {
                    commandCount += visitPipeline(sub, commandMap, fieldMap, baseFields);
                });
            }
            break;
        case 'StatsCommand':
            recordCommand(cmd.variant);
            cmd.aggregations.forEach((agg) => {
                if (agg.outputField) recordFields([agg.outputField], agg.location.startLine, fieldMap);
            });
            break;
        case 'EvalCommand':
            recordCommand('eval');
            cmd.assignments.forEach((assignment) => {
                recordFields([assignment.targetField], assignment.location.startLine, fieldMap);
                assignment.dependsOn.forEach((dep) => {
                    const normalized = dep.toLowerCase();
                    if (!baseFields.has(normalized)) {
                        recordFields([dep], assignment.location.startLine, fieldMap);
                    }
                });
            });
            break;
        case 'RenameCommand':
            recordCommand('rename');
            cmd.renamings.forEach((r) => {
                recordFields([r.oldField.fieldName, r.newField.fieldName], r.location.startLine, fieldMap);
            });
            break;
        case 'RexCommand':
            recordCommand('rex');
            recordFields(cmd.extractedFields, line, fieldMap);
            break;
        case 'LookupCommand':
            recordCommand('lookup');
            cmd.outputMappings.forEach((m) => recordFields([m.eventField], m.location.startLine, fieldMap));
            break;
        case 'InputlookupCommand':
            recordCommand('inputlookup');
            break;
        case 'SpathCommand':
            recordCommand('spath');
            if (cmd.outputField) recordFields([cmd.outputField], line, fieldMap);
            break;
        case 'TableCommand':
            recordCommand('table');
            break;
        case 'FieldsCommand':
            recordCommand('fields');
            break;
        case 'DedupCommand':
            recordCommand('dedup');
            break;
        case 'AppendCommand':
            recordCommand('append');
            commandCount += visitPipeline(cmd.subsearch, commandMap, fieldMap, baseFields);
            break;
        case 'JoinCommand':
            recordCommand('join');
            cmd.joinFields.forEach((f) => recordFields([f.fieldName], f.location.startLine, fieldMap));
            commandCount += visitPipeline(cmd.subsearch, commandMap, fieldMap, baseFields);
            break;
        case 'WhereCommand':
            recordCommand('where');
            recordFields(cmd.referencedFields, line, fieldMap);
            break;
        case 'BinCommand':
            recordCommand('bin');
            if (cmd.field) recordFields([cmd.field.fieldName], line, fieldMap);
            if (cmd.alias) recordFields([cmd.alias], line, fieldMap);
            break;
        case 'FillnullCommand':
            recordCommand('fillnull');
            cmd.fields.forEach((f) => recordFields([f.fieldName], f.location.startLine, fieldMap));
            break;
        case 'MvexpandCommand':
            recordCommand('mvexpand');
            if (cmd.field) recordFields([cmd.field.fieldName], line, fieldMap);
            break;
        case 'TransactionCommand':
            recordCommand('transaction');
            cmd.fields.forEach((f) => recordFields([f.fieldName], f.location.startLine, fieldMap));
            recordFields(cmd.createdFields, line, fieldMap);
            break;
        default:
            // Fallback for commands not explicitly covered
            if (cmd.type.endsWith('Command')) {
                recordCommand(cmd.type.replace('Command', '').toLowerCase());
            }
            break;
    }

    return commandCount;
}

function handleSearchExpression(
    expr: SearchExpression,
    fieldMap: FieldMap,
    baseFields: Set<string>,
): number {
    // Count base search as a command occurrence but skip adding to map
    const commandCount = 1;
    expr.referencedFields
        .map((f) => f.toLowerCase())
        .forEach((f) => baseFields.add(f));
    recordFields(expr.referencedFields, expr.location.startLine, fieldMap);
    return commandCount;
}

function visitPipeline(
    pipeline: Pipeline,
    commandMap: CommandMap,
    fieldMap: FieldMap,
    baseFields: Set<string>,
): number {
    let commandCount = 0;
    pipeline.stages.forEach((stage: PipelineStage) => {
        if ((stage as Command).type && (stage as Command).type.endsWith('Command')) {
            commandCount += handleCommand(stage as Command, commandMap, fieldMap, baseFields);
        } else if ((stage as SearchExpression).type === 'SearchExpression') {
            commandCount += handleSearchExpression(stage as SearchExpression, fieldMap, baseFields);
        }
    });
    return commandCount;
}

/**
 * Extract command and field mappings from a parsed SPL AST.
 *
 * Traverses the entire pipeline including subsearches to build maps of:
 * - Commands to line numbers where they appear
 * - Fields to line numbers where they are referenced or created
 *
 * @param pipeline - The parsed SPL pipeline AST
 * @returns Extraction result with command/field maps and total command count
 *
 * @example
 * ```typescript
 * const result = parseSPL('index=main | stats count BY host');
 * if (result.ast) {
 *   const { commandToLines, fieldToLines } = extractFromAst(result.ast);
 *   console.log(commandToLines.get('stats')); // [1]
 *   console.log(fieldToLines.get('host')); // [1]
 * }
 * ```
 */
export function extractFromAst(pipeline: Pipeline): ExtractionResult {
    const commandToLines: CommandMap = new Map();
    const fieldToLines: FieldMap = new Map();
    const baseFields: Set<string> = new Set();
    const commandCount = visitPipeline(pipeline, commandToLines, fieldToLines, baseFields);
    return {
        commandToLines,
        fieldToLines,
        commandCount,
    };
}
