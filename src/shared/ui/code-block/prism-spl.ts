/**
 * @fileoverview Prism.js language definition for SPL (Splunk Processing Language).
 * 
 * Registers SPL as a custom language with Prism.js, providing syntax highlighting
 * for Splunk queries. Defines token patterns for:
 * - Comments (backtick-delimited)
 * - Strings (single/double quoted)
 * - Keywords (search commands like stats, eval, where, etc.)
 * - Boolean operators (AND, OR, NOT, XOR)
 * - Functions (aggregation, string manipulation, date/time, math)
 * - Numbers (integers and decimals)
 * - Operators (pipe, comparison, assignment)
 * - Punctuation (parentheses, brackets, commas)
 * 
 * This module self-registers with Prism on import and should be imported
 * before using SPL syntax highlighting in CodeBlock components.
 * 
 * @module shared/ui/code-block/prism-spl
 */

import Prism from 'prismjs';

/**
 * SPL language definition for Prism.js syntax highlighting.
 * Defines token patterns and their corresponding CSS classes for styling.
 */
Prism.languages.spl = {
    'comment': {
        pattern: /`.*?`/,
        greedy: true
    },
    'string': {
        pattern: /("|')(?:\\.|(?!\1)[^\\\r\n])*\1/,
        greedy: true
    },
    'keyword': {
        pattern: /\b(?:stats|eval|search|where|table|rename|rex|timechart|dedup|sort|fields|top|rare|chart|history|metadata|inputlookup|outputlookup|lookup|transaction|join|append|appendcols)\b/i,
        greedy: true
    },
    'boolean': {
        pattern: /\b(?:AND|OR|NOT|XOR)\b/,
        greedy: true
    },
    'function': {
        pattern: /\b(?:count|sum|avg|min|max|list|values|dc|earliest|latest|perc\d+|median|mode|stdev|var|upper|lower|len|if|case|match|mvcount|mvindex|mvfilter|mvjoin|mvrange|mvzip|now|relative_time|strftime|strptime|floor|ceil|round|pow|sqrt|pi|random)\b/i,
        greedy: true
    },
    'number': {
        pattern: /\b\d+(?:\.\d+)?\b/,
        greedy: true
    },
    'operator': {
        pattern: /[|=<>]|!=/,
        greedy: true
    },
    'punctuation': /[()[\],]/
};

export const splLanguage = Prism.languages.spl;
export default splLanguage;
