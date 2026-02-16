import type { GroupedLineageContext, GroupedLineageRow } from './lineage-grouping';

const CSV_COLUMNS = [
  'group_key',
  'group_by',
  'index_id',
  'index_label',
  'sourcetype',
  'source',
  'lineage_key',
  'source_object_id',
  'source_object_type',
  'terminal_object_id',
  'terminal_object_type',
  'path_length',
  'cycle_detected',
  'path',
] as const;

function escapeCsvValue(value: string | number | boolean): string {
  const stringValue = String(value);
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function buildFlattenedLineageCsv(
  rows: GroupedLineageRow[],
  contextsByGroupKey: Map<string, GroupedLineageContext>
): string {
  const lines: string[] = [CSV_COLUMNS.join(',')];

  rows.forEach((row) => {
    const context = contextsByGroupKey.get(row.group_key);
    if (!context) {
      return;
    }

    context.paths.forEach((lineagePath) => {
      const pathText = lineagePath.path_node_ids.join(' -> ');

      const rowValues: Array<string | number | boolean> = [
        row.group_key,
        row.group_by,
        row.index_id,
        row.index_label,
        row.sourcetype,
        row.source,
        lineagePath.lineage_key,
        lineagePath.source_object_id,
        lineagePath.source_object_type,
        lineagePath.terminal_object_id,
        lineagePath.terminal_object_type,
        lineagePath.path_length,
        lineagePath.cycle_detected,
        pathText,
      ];

      lines.push(rowValues.map(escapeCsvValue).join(','));
    });
  });

  return `${lines.join('\n')}\n`;
}

export function downloadCsv(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
}
