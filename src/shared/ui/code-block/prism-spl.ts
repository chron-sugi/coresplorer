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
        pattern: /\b(?:abstract|accum|addcoltotals|addinfo|addtotals|analyzefields|anomalies|anomalousvalue|anomalydetection|append|appendcols|appendpipe|arules|associate|audit|autoregress|bin|bucket|bucketdir|chart|cluster|cofilter|collect|concurrency|contingency|convert|correlate|crawl|datamodel|dbinspect|dedup|delete|delta|diff|erex|eval|eventcount|eventstats|extract|kv|fieldformat|fields|fieldsummary|filldown|fillnull|findtypes|folderize|foreach|format|gauge|gentimes|geom|geostats|head|highlight|history|iconify|input|inputcsv|inputlookup|iplocation|join|kmeans|kvform|loadjob|localize|localop|lookup|makecontinuous|makemv|makeresults|map|mcatalog|mcollect|metadata|metasearch|meventcollect|mpreview|mstats|multikv|multisearch|mvcombine|mvexpand|nomv|outlier|outputcsv|outputlookup|outputtext|overlap|pivot|predict|rangemap|rare|regex|relevancy|reltime|rename|replace|rest|return|reverse|rex|rtorder|savedsearch|script|run|scrub|search|searchtxn|selfjoin|sendemail|set|setfields|sichart|sirare|sistats|sitimechart|sitop|sort|spath|stats|strcat|streamstats|table|tags|tail|timechart|timewrap|top|transaction|transpose|trendline|tscollect|tstats|typeahead|typelearner|typer|union|uniq|untable|walklex|where|x11|xmlkv|xmlunescape|xpath|xyseries)\b/i,
        greedy: true
    },
    'boolean': {
        pattern: /\b(?:AND|OR|NOT|XOR)\b/,
        greedy: true
    },
    'function': {
        pattern: /\b(?:count|sum|avg|min|max|list|values|dc|earliest|latest|perc\d+|median|mode|stdev|stdevp|var|varp|sumsq|range|first|last|earliest_time|latest_time|rate|per_hour|per_minute|per_second|per_day|upper|lower|len|substr|trim|ltrim|rtrim|replace|split|urldecode|printf|tonumber|tostring|typeof|isbool|isint|isnum|isstr|isnull|isnotnull|null|nullif|coalesce|validate|true|false|if|case|match|like|cidrmatch|searchmatch|in|mvcount|mvindex|mvfilter|mvjoin|mvrange|mvzip|mvappend|mvdedup|mvfind|mvsort|mvmap|commands|split|now|time|relative_time|strftime|strptime|floor|ceil|round|pow|sqrt|pi|random|abs|log|ln|exp|exact|sigfig|json_object|json_array|json_extract|json_extract_exact|json_keys|json_set|json_valid|md5|sha1|sha256|sha512|spath|xpath)\b/i,
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
