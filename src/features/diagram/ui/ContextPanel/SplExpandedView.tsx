import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { SplCodeBlock } from "./SplCodeBlock";

/**
 * Modal component for displaying an expanded view of SPL code.
 * Wraps the SplCodeBlock component in a dialog for better readability of long queries.
 */
interface SplExpandedViewProps {
    isOpen: boolean;
    onClose: () => void;
    code: string;
    title?: string;
}

/**
 * Renders a modal dialog containing the full SPL query code.
 * 
 * @param props - The component props
 * @param props.isOpen - Whether the modal is currently open
 * @param props.onClose - Callback function to close the modal
 * @param props.code - The SPL code string to display
 * @param props.title - Optional title for the modal header (default: "SPL Query")
 * @returns The rendered dialog component
 */
export function SplExpandedView({ isOpen, onClose, code, title = "SPL Query" }: SplExpandedViewProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col bg-slate-900 border-slate-800 text-slate-100 p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-4 border-b border-slate-800 bg-slate-900/50">
                    <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
                    <DialogDescription className="text-slate-400 text-sm">
                        Full search processing language query
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex-1 p-4 min-h-0 bg-slate-950/50">
                    <SplCodeBlock 
                        code={code} 
                        className="h-full"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
