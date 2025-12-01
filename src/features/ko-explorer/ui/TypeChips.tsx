/**
 * TypeChips Component
 *
 * Multi-select chip toggle component for filtering by Knowledge Object type.
 * Uses Radix UI Toggle Group for accessible multi-select behavior.
 *
 * @module features/ko-explorer/ui/TypeChips
 */
import { memo } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group';
import { useFilterStore } from '../model/store/useFilterStore';
import { getKoLabel, isValidKoType, type SplunkKoType } from '@/entities/knowledge-object';

interface TypeChipsProps {
  availableTypes: string[];
}

/**
 * Multi-select chip toggle for filtering by type.
 *
 * Displays all available types as toggleable chips.
 * Multiple chips can be selected simultaneously.
 *
 * @param props - Component props
 * @param props.availableTypes - Array of available type values
 */
export const TypeChips = memo(function TypeChips({ availableTypes }: TypeChipsProps): React.JSX.Element {
  const selectedTypes = useFilterStore((state) => state.types);
  const toggleType = useFilterStore((state) => state.toggleType);

  const handleValueChange = (values: string[]) => {
    // Find which type was toggled by comparing with current selection
    const added = values.find((v) => !selectedTypes.includes(v));
    const removed = selectedTypes.find((v) => !values.includes(v));
    const toggledType = added ?? removed;
    if (toggledType) {
      toggleType(toggledType);
    }
  };

  if (availableTypes.length === 0) {
    return <></>;
  }

  return (
    <ToggleGroup
      type="multiple"
      value={selectedTypes}
      onValueChange={handleValueChange}
      className="flex-wrap gap-3"
    >
      {availableTypes.map((type) => (
        <ToggleGroupItem key={type} value={type} aria-label={`Filter by ${type}`}>
          {isValidKoType(type) ? getKoLabel(type as SplunkKoType) : type}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
});
