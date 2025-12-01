import { CodeBlock } from '@/shared/ui/code-block/CodeBlock';

interface SplAnalysisEditorProps {
  code: string;
  highlightedLines: number[];
  highlightToken: string | null;
}

/**
 * Thin wrapper around CodeBlock used for SPL analysis previews.
 * Exposes highlighted lines and persistent token highlighting.
 */
export function SplAnalysisEditor({ code, highlightedLines, highlightToken }: SplAnalysisEditorProps) {
  return (
    <CodeBlock
      code={code}
      language="spl"
      showLineNumbers
      highlightedLines={highlightedLines}
      highlightToken={highlightToken}
    />
  );
}
