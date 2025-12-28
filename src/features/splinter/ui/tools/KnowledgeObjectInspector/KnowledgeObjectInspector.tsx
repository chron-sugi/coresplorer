/**
 * Object Inspector UI
 *
 * Small overlay that displays metadata for a selected knowledge object (macro,
 * lookup, saved search). Shows name, type, definition, arguments and fields.
 */

import { useKnowledgeObjectInspector } from '../../../model/hooks/useKnowledgeObjectInspector';
import { Database, FileCode, Search } from 'lucide-react';

interface KnowledgeKnowledgeObjectInspectorProps {
  selectedText: string | null;
}

export const KnowledgeObjectInspector = ({ selectedText }: KnowledgeKnowledgeObjectInspectorProps): React.JSX.Element | null => {
  const { objectDetails } = useKnowledgeObjectInspector(selectedText);

  if (!objectDetails) return null;

  const getIcon = () => {
    switch (objectDetails.type) {
      case 'macro': return <FileCode className="w-4 h-4 text-yellow-400" />;
      case 'lookup_def':
      case 'lookup_file': return <Database className="w-4 h-4 text-blue-400" />;
      default: return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="p-3 bg-slate-800/90 border border-slate-700 rounded-lg shadow-lg backdrop-blur-sm max-w-sm">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700/50">
        {getIcon()}
        <span className="font-mono text-sm font-semibold text-slate-200">
          {objectDetails.name}
        </span>
        <span className="ml-auto text-2xs uppercase tracking-wider text-slate-500 bg-slate-900/50 px-1.5 py-0.5 rounded">
          {objectDetails.type}
        </span>
      </div>

      <div className="space-y-3">
        {objectDetails.definition && (
          <div>
            <div className="text-2xs uppercase text-slate-500 mb-1">Definition</div>
            <div className="font-mono text-xs text-slate-300 bg-slate-900/50 p-2 rounded break-all">
              {objectDetails.definition}
            </div>
          </div>
        )}

        {objectDetails.args && objectDetails.args.length > 0 && (
          <div>
            <div className="text-2xs uppercase text-slate-500 mb-1">Arguments</div>
            <div className="flex flex-wrap gap-1">
              {objectDetails.args.map(arg => (
                <span key={arg} className="text-xs font-mono text-yellow-300/80 bg-yellow-900/20 px-1.5 py-0.5 rounded border border-yellow-700/30">
                  ${arg}
                </span>
              ))}
            </div>
          </div>
        )}

        {objectDetails.fields && objectDetails.fields.length > 0 && (
          <div>
            <div className="text-2xs uppercase text-slate-500 mb-1">Fields</div>
            <div className="flex flex-wrap gap-1">
              {objectDetails.fields.map(field => (
                <span key={field} className="text-xs font-mono text-blue-300/80 bg-blue-900/20 px-1.5 py-0.5 rounded border border-blue-700/30">
                  {field}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
