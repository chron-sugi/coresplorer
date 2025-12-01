import type {
    Pipeline,
    PipelineStage,
    Command,
    SearchExpression,
    FieldReference,
} from '@/entities/spl/lib/parser';

type CommandMap = Map<string, number[]>;
type FieldMap = Map<string, number[]>;

interface ExtractionResult {
    commandToLines: CommandMap;
    fieldToLines: FieldMap;
    commandCount: number;
}

const SKIP_COMMANDS = new Set(['search']);

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
): number {
    let commandCount = 1;
    const line = cmd.location.startLine;

    const recordCommand = (name: string | null) => {
        if (!name) return;
        const normalized = name.toLowerCase();
        if (!SKIP_COMMANDS.has(normalized)) {
            addToMap(commandMap, normalized, line);
        }
    };

    switch (cmd.type) {
        case 'GenericCommand':
            recordCommand(cmd.commandName);
            if (cmd.subsearches?.length) {
                cmd.subsearches.forEach((sub) => {
                    commandCount += visitPipeline(sub, commandMap, fieldMap);
                });
            }
            break;
        case 'StatsCommand':
            recordCommand(cmd.variant);
            cmd.aggregations.forEach((agg) => {
                if (agg.outputField) recordFields([agg.outputField], agg.location.startLine, fieldMap);
                if (agg.field) recordFields([agg.field.fieldName], agg.location.startLine, fieldMap);
            });
            cmd.byFields.forEach((f) => recordFields([f.fieldName], f.location.startLine, fieldMap));
            break;
        case 'EvalCommand':
            recordCommand('eval');
            cmd.assignments.forEach((assignment) => {
                recordFields([assignment.targetField], assignment.location.startLine, fieldMap);
                recordFields(assignment.dependsOn, assignment.location.startLine, fieldMap);
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
            if (cmd.sourceField) recordFields([cmd.sourceField], line, fieldMap);
            recordFields(cmd.extractedFields, line, fieldMap);
            break;
        case 'LookupCommand':
            recordCommand('lookup');
            cmd.inputMappings.forEach((m) => recordFields([m.eventField], m.location.startLine, fieldMap));
            cmd.outputMappings.forEach((m) => recordFields([m.eventField], m.location.startLine, fieldMap));
            break;
        case 'InputlookupCommand':
            recordCommand('inputlookup');
            break;
        case 'SpathCommand':
            recordCommand('spath');
            if (cmd.inputField) recordFields([cmd.inputField], line, fieldMap);
            if (cmd.outputField) recordFields([cmd.outputField], line, fieldMap);
            break;
        case 'TableCommand':
            recordCommand('table');
            cmd.fields.forEach((f: FieldReference) => recordFields([f.fieldName], f.location.startLine, fieldMap));
            break;
        case 'FieldsCommand':
            recordCommand('fields');
            cmd.fields.forEach((f: FieldReference) => recordFields([f.fieldName], f.location.startLine, fieldMap));
            break;
        case 'DedupCommand':
            recordCommand('dedup');
            cmd.fields.forEach((f) => recordFields([f.fieldName], f.location.startLine, fieldMap));
            break;
        case 'AppendCommand':
            recordCommand('append');
            commandCount += visitPipeline(cmd.subsearch, commandMap, fieldMap);
            break;
        case 'JoinCommand':
            recordCommand('join');
            cmd.joinFields.forEach((f) => recordFields([f.fieldName], f.location.startLine, fieldMap));
            commandCount += visitPipeline(cmd.subsearch, commandMap, fieldMap);
            break;
        case 'WhereCommand':
            recordCommand('where');
            recordFields(cmd.referencedFields, line, fieldMap);
            break;
        case 'BinCommand':
            recordCommand('bin');
            if ((cmd as any).field) recordFields([(cmd as any).field], line, fieldMap);
            if ((cmd as any).alias) recordFields([(cmd as any).alias], line, fieldMap);
            break;
        case 'FillnullCommand':
            recordCommand('fillnull');
            cmd.fields.forEach((f) => recordFields([f.fieldName], f.location.startLine, fieldMap));
            break;
        case 'MvexpandCommand':
            recordCommand('mvexpand');
            if ((cmd as any).field) recordFields([(cmd as any).field], line, fieldMap);
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
    commandMap: CommandMap,
    fieldMap: FieldMap,
): number {
    // Count base search as a command occurrence but skip adding to map
    const commandCount = 1;
    recordFields(expr.referencedFields, expr.location.startLine, fieldMap);
    return commandCount;
}

function visitPipeline(
    pipeline: Pipeline,
    commandMap: CommandMap,
    fieldMap: FieldMap,
): number {
    let commandCount = 0;
    pipeline.stages.forEach((stage: PipelineStage) => {
        if ((stage as Command).type && (stage as Command).type.endsWith('Command')) {
            commandCount += handleCommand(stage as Command, commandMap, fieldMap);
        } else if ((stage as SearchExpression).type === 'SearchExpression') {
            commandCount += handleSearchExpression(stage as SearchExpression, commandMap, fieldMap);
        }
    });
    return commandCount;
}

export function extractFromAst(pipeline: Pipeline): ExtractionResult {
    const commandToLines: CommandMap = new Map();
    const fieldToLines: FieldMap = new Map();
    const commandCount = visitPipeline(pipeline, commandToLines, fieldToLines);
    return {
        commandToLines,
        fieldToLines,
        commandCount,
    };
}
