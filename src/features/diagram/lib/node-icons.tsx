import {
  LayoutDashboard,
  Search,
  Scroll,
  Activity,
  Table,
  Database,
  HardDrive,
  HelpCircle,
  FileSpreadsheet,
  Layers,
  Share2,
  type LucideIcon,
} from 'lucide-react';

export { Layers, Share2 };

export const KO_ICON_MAP: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  saved_search: Search,
  macro: Scroll,
  event_type: Activity,
  lookup: Table, // Legacy? Keeping just in case
  lookup_def: Table,
  lookup_file: FileSpreadsheet,
  data_model: Database,
  index: HardDrive,
  unknown: HelpCircle,
};

export function getNodeIcon(type: string): LucideIcon {
  return KO_ICON_MAP[type] || HelpCircle;
}
