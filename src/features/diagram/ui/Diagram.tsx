
/**
 * Diagram root component
 *
 * Wires together React Flow, layout, data hooks and the context panel.
 */
import { DiagramCanvas } from "./Canvas/Canvas";

/**
 * Main diagram page component
 * 
 * Root component for the diagram feature that renders the React Flow canvas.
 * Provides the container structure for the interactive knowledge object graph.
 * 
 * @returns Rendered diagram page with canvas
 */
export function Diagram(): React.JSX.Element {
    return (
        <div className="flex h-full w-full overflow-hidden bg-slate-50">
            {/* Main Canvas Area */}
            <div className="flex-1 relative h-full">
                <DiagramCanvas />
            </div>
        </div>
    );
}
