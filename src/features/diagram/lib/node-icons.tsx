import {
  LayoutDashboard,
  Search,
  Scroll,
  Activity,
  Table,
  Database,
  HardDrive,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';

export const KO_ICON_MAP: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  saved_search: Search,
  macro: Scroll,
  event_type: Activity,
  lookup: Table,
  data_model: Database,
  index: HardDrive,
  unknown: HelpCircle,
};

export function getNodeIcon(type: string): LucideIcon {
  return KO_ICON_MAP[type] || HelpCircle;
}
