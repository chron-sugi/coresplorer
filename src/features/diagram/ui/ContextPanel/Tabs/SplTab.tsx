/**
 * SPL tab
 *
 * Presents SPL code for the selected node with copy/expand controls.
 */
import { useState } from 'react';
import { SplCodeBlock } from '../SplCodeBlock';
import { SplExpandedView } from '../SplExpandedView';

interface SplTabProps {
    code: string;
    nodeName: string;
}

/**
 * Renders the SPL tab content, including inline code block and an optional
 * expanded modal view.
 */
export function SplTab({ code, nodeName }: SplTabProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!code) {
        return (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm px-4 text-center">
                No SPL code available for this node
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-4 min-h-0">
            <SplCodeBlock 
                code={code} 
                onExpand={() => setIsExpanded(true)}
                className="flex-1"
            />
            
            <SplExpandedView
                isOpen={isExpanded}
                onClose={() => setIsExpanded(false)}
                code={code}
                title={nodeName}
            />
        </div>
    );
}
