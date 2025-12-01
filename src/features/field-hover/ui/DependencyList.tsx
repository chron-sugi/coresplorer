/**
 * DependencyList
 *
 * Displays the list of fields that a field depends on.
 *
 * @module features/field-hover/ui/DependencyList
 */

interface DependencyListProps {
  dependencies: string[];
  label?: string;
  className?: string;
}

export function DependencyList({
  dependencies,
  label = 'Depends on',
  className = '',
}: DependencyListProps): React.JSX.Element | null {
  if (dependencies.length === 0) {
    return null;
  }

  return (
    <div className={`text-xs ${className}`}>
      <span className="text-slate-500">{label}: </span>
      <span className="text-cyan-400 font-mono">
        {dependencies.join(', ')}
      </span>
    </div>
  );
}
