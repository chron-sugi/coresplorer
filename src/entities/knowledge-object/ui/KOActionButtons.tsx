/**
 * Knowledge Object Action Buttons
 * 
 * Shared component for displaying action icons (Diagram, Splinter, Splunk) for a Knowledge Object.
 * Used in SearchCommand results, KOTable rows, and potentially other lists.
 * 
 * @module entities/knowledge-object/ui/KOActionButtons
 */
import { Network, Code, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { encodeUrlParam } from "@/shared/lib";
import { buildSplunkUrl, isSplunkWebUrlAvailable } from "@/shared/config/splunk.config";
import { nodeHasSpl } from "../lib/ko.utils";

interface KOActionButtonsProps {
    ko: {
        id: string;
        name: string;
        type: string;
        app: string;
        owner?: string;
    };
    variant?: "default" | "ghost";
    size?: "default" | "sm" | "icon";
    className?: string;
}

export function KOActionButtons({ ko, variant = "ghost", size = "sm", className }: KOActionButtonsProps) {
    const navigate = useNavigate();
    const splunkAvailable = isSplunkWebUrlAvailable();

    const handleDiagramClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/diagram/${encodeUrlParam(ko.id)}`);
    };

    const handleSplinterClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate('/splinter', { state: { loadNodeId: ko.id } });
    };

    const hasSpl = nodeHasSpl(ko.type);

    // Dynamic sizing logic
    const buttonSizeClass = size === 'default' ? 'h-8 w-8' : 'h-6 w-6';
    const iconSizeClass = size === 'default' ? 'h-5 w-5' : 'h-3.5 w-3.5';

    return (
        <div className={`flex gap-1 items-center ${className || ''}`}>
            <Button
                variant={variant}
                size={size}
                className={`${buttonSizeClass} p-0 hover:bg-slate-700 text-slate-400 hover:text-sky-400`}
                onClick={handleDiagramClick}
                title="View in diagram"
            >
                <Network className={iconSizeClass} />
            </Button>
            
            <Button
                variant={variant}
                size={size}
                className={`${buttonSizeClass} p-0 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400 hover:text-sky-400`}
                disabled={!hasSpl}
                onClick={handleSplinterClick}
                title={hasSpl ? "Load SPL code" : "No SPL code available"}
            >
                <Code className={iconSizeClass} />
            </Button>

            {splunkAvailable && (() => {
                const splunkUrl = buildSplunkUrl({
                    name: ko.name,
                    type: ko.type,
                    app: ko.app,
                    owner: ko.owner,
                });
                
                return splunkUrl ? (
                    <a
                        href={splunkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center justify-center ${buttonSizeClass} p-0 rounded-md hover:bg-slate-700 text-slate-400 hover:text-sky-400 transition-colors`}
                        onClick={(e) => e.stopPropagation()}
                        title="View in Splunk"
                    >
                        <ExternalLink className={iconSizeClass} />
                    </a>
                ) : null;
            })()}
        </div>
    );
}
