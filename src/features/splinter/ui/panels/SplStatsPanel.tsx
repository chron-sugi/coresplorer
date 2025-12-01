/**
 * Context Stats Panel
 *
 * Provides a small container component that connects the global inspector store
 * to the `SplStats` presentational component. Handles user interactions from
 * the stats view (command and field badge clicks) and updates the inspector
 * store with the active selection and highlighted lines.
 */
import { useInspectorStore } from '../../model/store/splinter.store';
import { SplStats } from '../components/SplStats';
import { useEditorStore, selectSplText } from '@/entities/spl';
import { selectParseResult } from '@/entities/spl';

export const SplStatsPanel = (): React.JSX.Element => {
    const code = useEditorStore(selectSplText);
    const parseResult = useEditorStore(selectParseResult);
    const { 
        activeCommand, 
        activeField, 
        setActiveCommand, 
        setActiveField, 
        setHighlightedLines 
    } = useInspectorStore();

    /**
     * Handle clicks on command badges in the stats view.
     *
     * Toggles the active command in the inspector store and updates the set of
     * highlighted lines. Clears any active field when a command is selected.
     *
     * @param command - The command string that was clicked (e.g. "stats").
     * @param lines - Array of line numbers associated with the command.
     * @returns void
     */
    const handleCommandClick = (command: string, lines: number[]) => {
        if (activeCommand === command) {
            setActiveCommand(null);
            setHighlightedLines([]);
            return;
        }
        setActiveField(null);
        setActiveCommand(command);
        setHighlightedLines(lines);
    };

    /**
     * Handle clicks on field badges in the stats view.
     *
     * Toggles the active field in the inspector store and updates highlighted
     * lines. Clears any active command when a field is selected.
     *
     * @param field - The field name that was clicked.
     * @param lines - Array of line numbers associated with the field.
     * @returns void
     */
    const handleFieldClick = (field: string, lines: number[]) => {
        if (activeField === field) {
            setActiveField(null);
            setHighlightedLines([]);
            return;
        }
        setActiveCommand(null);
        setActiveField(field);
        setHighlightedLines(lines);
    };

    /**
     * SplStatsPanel component
     *
     * Renders the `SplStats` component wired to inspector state. Provides
     * callbacks to respond to command and field badge clicks so the store can
     * highlight corresponding lines in the editor.
     *
     * @returns React.JSX.Element - Rendered stats panel
     */
    return (
        <SplStats 
            code={code} 
            parseResult={parseResult}
            onCommandClick={handleCommandClick}
            onFieldClick={handleFieldClick}
            activeCommand={activeCommand}
            activeField={activeField}
        />
    );
};
