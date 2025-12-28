/**
 * SPL Copy Safety Utilities
 *
 * Detects and removes risky commands (collect, outputlookup) from SPL code
 * before copying to clipboard using simple string pattern matching.
 *
 * @module shared/lib/spl-safety
 */

/**
 * Information about a risky command found in SPL code
 */
export interface RiskyCommand {
  /** AST node type of the command */
  type: 'CollectCommand' | 'OutputlookupCommand';
  /** Human-readable command name */
  commandName: string;
  /** Starting line number (1-indexed) */
  startLine: number;
  /** Ending line number (1-indexed) */
  endLine: number;
  /** Starting character offset (0-indexed) */
  startOffset: number;
  /** Ending character offset (0-indexed) */
  endOffset: number;
}

/**
 * Result of detecting risky commands in SPL code
 */
export interface RiskyCommandsResult {
  /** Whether any risky commands were found */
  hasRiskyCommands: boolean;
  /** Details of all risky commands found */
  commands: RiskyCommand[];
  /** Unique command names found (e.g., ['collect', 'outputlookup']) */
  commandNames: string[];
}

/**
 * Detect risky commands in SPL code using simple pattern matching.
 * Searches for "| collect" and "| outputlookup" patterns.
 *
 * @param spl - The SPL code to analyze
 * @returns Information about risky commands found
 *
 * @example
 * ```typescript
 * const result = detectRiskyCommands('index=main | stats count | collect index=summary');
 * // result.hasRiskyCommands === true
 * // result.commandNames === ['collect']
 * // result.commands[0].startLine === 1
 * ```
 */
export function detectRiskyCommands(spl: string): RiskyCommandsResult {
  if (!spl || spl.trim().length === 0) {
    return { hasRiskyCommands: false, commands: [], commandNames: [] };
  }

  const riskyCommands: RiskyCommand[] = [];
  const lines = spl.split('\n');

  // Pattern to match pipe followed by collect or outputlookup command
  // Allows for optional whitespace around the pipe
  const collectPattern = /\|\s*collect\b/i;
  const outputlookupPattern = /\|\s*outputlookup\b/i;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const lineNumber = lineIndex + 1; // 1-indexed

    // Check for collect command
    const collectMatch = line.match(collectPattern);
    if (collectMatch) {
      const startOffset = spl.split('\n').slice(0, lineIndex).join('\n').length +
                         (lineIndex > 0 ? 1 : 0) + // Add 1 for newline if not first line
                         collectMatch.index!;

      // Find end of command (next pipe or end of text)
      const remainingText = spl.substring(startOffset);
      let nextPipeIndex = remainingText.indexOf('|', 1); // Skip the current pipe

      let endOffset: number;
      if (nextPipeIndex === -1) {
        endOffset = spl.length - 1;
      } else {
        // Check if there's a newline before the next pipe
        const textBeforeNextPipe = remainingText.substring(0, nextPipeIndex);
        const lastNewlineIndex = textBeforeNextPipe.lastIndexOf('\n');

        if (lastNewlineIndex !== -1) {
          // Stop before the newline that precedes the next pipe
          endOffset = startOffset + lastNewlineIndex - 1;
        } else {
          // No newline, stop just before the next pipe
          endOffset = startOffset + nextPipeIndex - 1;
        }
      }

      // Calculate end line
      const textUpToEnd = spl.substring(0, endOffset + 1);
      const endLine = textUpToEnd.split('\n').length;

      riskyCommands.push({
        type: 'CollectCommand',
        commandName: 'collect',
        startLine: lineNumber,
        endLine: endLine,
        startOffset: startOffset,
        endOffset: endOffset,
      });
    }

    // Check for outputlookup command
    const outputlookupMatch = line.match(outputlookupPattern);
    if (outputlookupMatch) {
      const startOffset = spl.split('\n').slice(0, lineIndex).join('\n').length +
                         (lineIndex > 0 ? 1 : 0) + // Add 1 for newline if not first line
                         outputlookupMatch.index!;

      // Find end of command (next pipe or end of text)
      const remainingText = spl.substring(startOffset);
      let nextPipeIndex = remainingText.indexOf('|', 1); // Skip the current pipe

      let endOffset: number;
      if (nextPipeIndex === -1) {
        endOffset = spl.length - 1;
      } else {
        // Check if there's a newline before the next pipe
        const textBeforeNextPipe = remainingText.substring(0, nextPipeIndex);
        const lastNewlineIndex = textBeforeNextPipe.lastIndexOf('\n');

        if (lastNewlineIndex !== -1) {
          // Stop before the newline that precedes the next pipe
          endOffset = startOffset + lastNewlineIndex - 1;
        } else {
          // No newline, stop just before the next pipe
          endOffset = startOffset + nextPipeIndex - 1;
        }
      }

      // Calculate end line
      const textUpToEnd = spl.substring(0, endOffset + 1);
      const endLine = textUpToEnd.split('\n').length;

      riskyCommands.push({
        type: 'OutputlookupCommand',
        commandName: 'outputlookup',
        startLine: lineNumber,
        endLine: endLine,
        startOffset: startOffset,
        endOffset: endOffset,
      });
    }
  }

  // Get unique command names for display
  const commandNames = Array.from(
    new Set(riskyCommands.map(cmd => cmd.commandName))
  ).sort();

  return {
    hasRiskyCommands: riskyCommands.length > 0,
    commands: riskyCommands,
    commandNames,
  };
}

/**
 * Remove risky commands from SPL text using character offsets.
 * Handles both single-line and multi-line SPL by removing exact command text.
 * Also cleans up pipe separators left behind after removal.
 *
 * @param spl - The original SPL code
 * @param commands - The risky commands to remove (from detectRiskyCommands)
 * @returns The SPL code with risky commands removed
 *
 * @example
 * ```typescript
 * const spl = 'index=main | stats count | collect index=summary';
 * const result = detectRiskyCommands(spl);
 * const cleaned = removeRiskyCommands(spl, result.commands);
 * // cleaned === 'index=main | stats count'
 * ```
 */
export function removeRiskyCommands(spl: string, commands: RiskyCommand[]): string {
  if (commands.length === 0) return spl;

  // Sort commands by startOffset in descending order
  // This allows us to remove from end to beginning without offset issues
  const sortedCommands = [...commands].sort((a, b) => b.startOffset - a.startOffset);

  let result = spl;

  for (const cmd of sortedCommands) {
    // Remove the command text using character offsets
    // Note: endOffset is inclusive, so we add 1 for substring (which uses exclusive end)
    const before = result.substring(0, cmd.startOffset);
    const after = result.substring(cmd.endOffset + 1);

    // Combine and clean up any leftover pipe separators
    result = before + after;
  }

  // Clean up extra pipes and whitespace
  result = result
    // Remove double pipes on same line (e.g., "| |" becomes "|")
    // Use [ \t] instead of \s to avoid matching newlines
    .replace(/\|[ \t]*\|/g, '|')
    // Remove trailing whitespace and pipes from end of lines (including space before pipe)
    .replace(/[ \t]*\|?[ \t]*$/gm, '')
    // Remove lines that are only whitespace
    .split('\n')
    .filter(line => !line.match(/^\s*$/))
    .join('\n')
    // Trim trailing whitespace from whole result
    .trimEnd();

  return result;
}
