/**
 * reverse Command Pattern
 */

import type { CommandSyntax } from '../types';

export const reverseCommand: CommandSyntax = {
  "command": "reverse",
  "syntax": {
    "kind": "literal",
    "value": "reverse"
  }
};
