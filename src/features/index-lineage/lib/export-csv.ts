import type { IndexLineagePath, IndexLineageRecord } from '@/entities/index-lineage';

const CSV_COLUMNS = [
  'lineage_key',
  'index_id',
  'index_label',
  'sourcetype',
  'source',
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
  records: IndexLineageRecord[],
  allPaths: IndexLineagePath[]
): string {
  const selectedKeys = new Set(records.map((record) => record.lineage_key));
  const filteredPaths = allPaths.filter((lineagePath) => selectedKeys.has(lineagePath.lineage_key));
  const recordByKey = new Map(records.map((record) => [record.lineage_key, record]));

  const lines: string[] = [CSV_COLUMNS.join(',')];

  filteredPaths.forEach((lineagePath) => {
    const record = recordByKey.get(lineagePath.lineage_key);
    if (!record) {
      return;
    }

    const pathText = lineagePath.path_node_ids.join(' -> ');

    const rowValues: Array<string | number | boolean> = [
      lineagePath.lineage_key,
      record.index_id,
      record.index_label,
      record.sourcetype,
      record.source,
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

