import type { CommandSyntax } from './types';

/**
 * abstract command
 *
 * Category: formatting
 * Description: Produce an abstract -- a summary or brief representation -- of the text of search results.  The original text is replaced by the summary, which is produced by a scoring mechanism.  If the event is larger than the selected maxlines, those with more terms and more terms on adjacent lines are preferred over those with fewer terms.  If a line has a search term, its neighboring lines also partially match, and may be returned to provide context. When there are gaps between the selected lines, lines are prefixed with "...". \p\ If the text of a result has fewer lines or an equal number of lines to maxlines, no change will occur.\i\ * <maxlines> accepts values from 1 - 500. \i\ * <maxterms> accepts values from 1 - 1000.
 */
export const abstractCommand: CommandSyntax = {
  "command": "abstract",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "abstract"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "maxterms"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "maxlines"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "formatting",
  "description": "Produce an abstract -- a summary or brief representation -- of the text of search results.  The original text is replaced by the summary, which is produced by a scoring mechanism.  If the event is larger than the selected maxlines, those with more terms and more terms on adjacent lines are preferred over those with fewer terms.  If a line has a search term, its neighboring lines also partially match, and may be returned to provide context. When there are gaps between the selected lines, lines are prefixed with \"...\". \\p\\ If the text of a result has fewer lines or an equal number of lines to maxlines, no change will occur.\\i\\ * <maxlines> accepts values from 1 - 500. \\i\\ * <maxterms> accepts values from 1 - 1000.",
  "related": [
    "highlight"
  ],
  "tags": [
    "condense",
    "summarize",
    "summary",
    "outline",
    "pare",
    "prune",
    "shorten",
    "skim",
    "snip",
    "sum",
    "trim"
  ]
};

/**
 * accum command
 *
 * Category: fields::add
 * Description: For each event where <field> is a number, keep a running total of the sum of this number and write it out to either the same field, or a new field if specified.
 */
export const accumCommand: CommandSyntax = {
  "command": "accum",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "accum"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "creates"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "literal",
              "value": "AS"
            },
            {
              "kind": "param",
              "type": "field",
              "effect": "creates"
            }
          ]
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "fields::add",
  "description": "For each event where <field> is a number, keep a running total of the sum of this number and write it out to either the same field, or a new field if specified.",
  "related": [
    "autoregress",
    "delta",
    "streamstats",
    "trendline"
  ],
  "tags": [
    "total",
    "sum",
    "accumulate"
  ]
};

/**
 * addcoltotals command
 *
 * Category: reporting
 * Description: Appends a new result to the end of the search result set. The result contains the sum of each numeric field or you can specify which fields to summarize. Results are displayed on the Statistics tab. If the labelfield argument is specified, a column is added to the statistical results table with the name specified.
 */
export const addcoltotalsCommand: CommandSyntax = {
  "command": "addcoltotals",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "addcoltotals"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "labelfield",
          "effect": "consumes"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "label"
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field-list",
        "quantifier": "?",
        "effect": "consumes"
      }
    ]
  },
  "category": "reporting",
  "description": "Appends a new result to the end of the search result set. The result contains the sum of each numeric field or you can specify which fields to summarize. Results are displayed on the Statistics tab. If the labelfield argument is specified, a column is added to the statistical results table with the name specified.",
  "related": [
    "stats"
  ],
  "tags": [
    "total",
    "add",
    "calculate",
    "sum"
  ]
};

/**
 * addinfo command
 *
 * Category: fields::add
 * Description: Adds global information about the search to each event.  The addinfo command is primarily an internal component of summary indexing. \i\ Currently the following fields are added: \i\ "info_min_time"    - the earliest time bound for the search \i\ "info_max_time"    - the latest time bound for the search \i\ "info_search_id"   - query id of the search that generated the event \i\ "info_search_time" - time when the search was executed.
 */
export const addinfoCommand: CommandSyntax = {
  "command": "addinfo",
  "syntax": {
    "kind": "literal",
    "value": "addinfo"
  },
  "category": "fields::add",
  "description": "Adds global information about the search to each event.  The addinfo command is primarily an internal component of summary indexing. \\i\\ Currently the following fields are added: \\i\\ \"info_min_time\"    - the earliest time bound for the search \\i\\ \"info_max_time\"    - the latest time bound for the search \\i\\ \"info_search_id\"   - query id of the search that generated the event \\i\\ \"info_search_time\" - time when the search was executed.",
  "related": [
    "search"
  ],
  "tags": [
    "search",
    "info"
  ]
};

/**
 * addtotals command
 *
 * Category: reporting
 * Description: If "row=t" (default if invoked as 'addtotals') for each result, computes the arithmetic sum of all numeric fields that match <field-list> (wildcarded field list). If list is empty all fields are considered. The sum is placed in the specified field or "Total" if none was specified. If "col=t" (default if invoked as 'addcoltotals'), adds a new result at the end that represents the sum of each field. LABELFIELD, if specified, is a field that will be added to this summary event with the value set by the 'label' option.
 */
export const addtotalsCommand: CommandSyntax = {
  "command": "addtotals",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "addtotals"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "row"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "col"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "labelfield",
          "effect": "consumes"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "label"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "fieldname",
          "effect": "consumes"
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field-list",
        "effect": "consumes"
      }
    ]
  },
  "category": "reporting",
  "description": "If \"row=t\" (default if invoked as 'addtotals') for each result, computes the arithmetic sum of all numeric fields that match <field-list> (wildcarded field list). If list is empty all fields are considered. The sum is placed in the specified field or \"Total\" if none was specified. If \"col=t\" (default if invoked as 'addcoltotals'), adds a new result at the end that represents the sum of each field. LABELFIELD, if specified, is a field that will be added to this summary event with the value set by the 'label' option.",
  "related": [
    "stats"
  ],
  "tags": [
    "total",
    "add",
    "calculate",
    "sum"
  ]
};

/**
 * analyzefields command
 *
 * Category: reporting
 * Description: Using <field> as a discrete random variable, analyze all *numerical* fields to determine the ability for each of those fields to "predict" the value of the classfield. In other words, analyzefields determines the stability of the relationship between values in the target classfield and numeric values in other fields. \i\ As a reporting command, analyzefields consumes all input results, and generates one output result per identified numeric field. \i\ For best results, classfield should have 2 distinct values, although multi-class analysis is possible.
 */
export const analyzefieldsCommand: CommandSyntax = {
  "command": "analyzefields",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "analyzefields"
      },
      {
        "kind": "param",
        "type": "field",
        "name": "classfield",
        "effect": "consumes"
      }
    ]
  },
  "category": "reporting",
  "description": "Using <field> as a discrete random variable, analyze all *numerical* fields to determine the ability for each of those fields to \"predict\" the value of the classfield. In other words, analyzefields determines the stability of the relationship between values in the target classfield and numeric values in other fields. \\i\\ As a reporting command, analyzefields consumes all input results, and generates one output result per identified numeric field. \\i\\ For best results, classfield should have 2 distinct values, although multi-class analysis is possible.",
  "related": [
    "anomalousvalue"
  ],
  "tags": [
    "analyze",
    "predict"
  ]
};

/**
 * anomalies command
 *
 * Category: results::filter
 * Description: Determines the degree of "unexpectedness" of an event's field  value, based on the previous MAXVALUE events.  By default it removes events that are well-expected (unexpectedness > THRESHOLD). The default THRESHOLD is 0.01.  If LABELONLY is true, no events are removed, and the "unexpectedness" attribute is set on all events.  The FIELD analyzed by default is "_raw". By default, NORMALIZE is true, which normalizes numerics.  For cases where FIELD contains numeric data that should not be normalized, but treated as categories, set NORMALIZE=false. The BLACKLIST is a name of a csv file of events in $SPLUNK_HOME/var/run/splunk/<BLACKLIST>.csv, such that any incoming events that are similar to the blacklisted events are treated as not anomalous (i.e., uninteresting) and given an unexpectedness score of 0.0.  Events that match blacklisted events with a similarity score above BLACKLISTTHRESHOLD (defaulting to 0.05) are marked as unexpected.  The inclusion of a 'by' clause, allows the specification of a list of fields to segregate results for anomaly detection.  For each combination of values for the specified field(s), events with those values are treated entirely separately. Therefore, 'anomalies by source' will look for anomalies in each source separately -- a pattern in one source will not affect that it is anomalous in another source.
 */
export const anomaliesCommand: CommandSyntax = {
  "command": "anomalies",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "anomalies"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "num",
          "name": "threshold"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "labelonly"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "normalize"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "maxvalues"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "field"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "blacklist"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "num",
          "name": "blacklistthreshold"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "results::filter",
  "description": "Determines the degree of \"unexpectedness\" of an event's field  value, based on the previous MAXVALUE events.  By default it removes events that are well-expected (unexpectedness > THRESHOLD). The default THRESHOLD is 0.01.  If LABELONLY is true, no events are removed, and the \"unexpectedness\" attribute is set on all events.  The FIELD analyzed by default is \"_raw\". By default, NORMALIZE is true, which normalizes numerics.  For cases where FIELD contains numeric data that should not be normalized, but treated as categories, set NORMALIZE=false. The BLACKLIST is a name of a csv file of events in $SPLUNK_HOME/var/run/splunk/<BLACKLIST>.csv, such that any incoming events that are similar to the blacklisted events are treated as not anomalous (i.e., uninteresting) and given an unexpectedness score of 0.0.  Events that match blacklisted events with a similarity score above BLACKLISTTHRESHOLD (defaulting to 0.05) are marked as unexpected.  The inclusion of a 'by' clause, allows the specification of a list of fields to segregate results for anomaly detection.  For each combination of values for the specified field(s), events with those values are treated entirely separately. Therefore, 'anomalies by source' will look for anomalies in each source separately -- a pattern in one source will not affect that it is anomalous in another source.",
  "related": [
    "anomalousvalue",
    "cluster",
    "kmeans",
    "outlier"
  ],
  "tags": [
    "anomaly",
    "unusual",
    "odd",
    "irregular",
    "dangerous",
    "unexpected",
    "outlier"
  ]
};

/**
 * anomalousvalue command
 *
 * Category: reporting
 * Description: Identifies or summarizes the values in the data that are anomalous either by frequency of occurrence  or number of standard deviations from the mean.  If a field-list is given, only those fields are considered.  Otherwise all non internal fields are considered. \p\ For fields that are considered anomalous, a new field is added with the following scheme. If the field is numeric, e.g. \"size\",  the new field will be  \"Anomaly_Score_Num(size)\". If the field is non-numeric, e.g. \"name\", the new field will be \"Anomaly_Score_Cat(name)\".
 */
export const anomalousvalueCommand: CommandSyntax = {
  "command": "anomalousvalue",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "anomalousvalue"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "*",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field-list",
        "quantifier": "?",
        "effect": "consumes"
      }
    ]
  },
  "category": "reporting",
  "description": "Identifies or summarizes the values in the data that are anomalous either by frequency of occurrence  or number of standard deviations from the mean.  If a field-list is given, only those fields are considered.  Otherwise all non internal fields are considered. \\p\\ For fields that are considered anomalous, a new field is added with the following scheme. If the field is numeric, e.g. \\\"size\\\",  the new field will be  \\\"Anomaly_Score_Num(size)\\\". If the field is non-numeric, e.g. \\\"name\\\", the new field will be \\\"Anomaly_Score_Cat(name)\\\".",
  "related": [
    "af",
    "anomalies",
    "cluster",
    "kmeans",
    "outlier"
  ],
  "tags": [
    "anomaly",
    "unusual",
    "odd",
    "irregular",
    "dangerous",
    "unexpected"
  ]
};

/**
 * anomalydetection command
 *
 * Category: streaming, reporting
 * Description: Identify anomalous events by computing a probability for each event and then detecting unusually small probabilities.  The probability is defined as the product of the frequencies of each individual field value in the event. For categorical fields, the frequency of a value X is the number of times X occurs divided by the total number of events. For numerical fields, we first build a histogram for all the values, then compute the frequency of a value X as the size of the bin that contains X divided by the number of events. Missing values are treated by adding a special value and updating its count just like a normal value. Histograms are built using the standard Scott's rule to determine the bin width.
 */
export const anomalydetectionCommand: CommandSyntax = {
  "command": "anomalydetection",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "anomalydetection"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field-list",
        "quantifier": "?",
        "effect": "consumes"
      }
    ]
  },
  "category": "streaming, reporting",
  "description": "Identify anomalous events by computing a probability for each event and then detecting unusually small probabilities.  The probability is defined as the product of the frequencies of each individual field value in the event. For categorical fields, the frequency of a value X is the number of times X occurs divided by the total number of events. For numerical fields, we first build a histogram for all the values, then compute the frequency of a value X as the size of the bin that contains X divided by the number of events. Missing values are treated by adding a special value and updating its count just like a normal value. Histograms are built using the standard Scott's rule to determine the bin width.",
  "related": [
    "anomalies",
    "anomalousvalue",
    "outlier",
    "cluster",
    "kmeans"
  ],
  "tags": [
    "anomaly",
    "unusual",
    "odd",
    "irregular",
    "dangerous",
    "unexpected",
    "Bayes"
  ]
};

/**
 * append command
 *
 * Category: results::append
 * Description: Append the results of a subsearch as additional results at the end of the current results.
 */
export const appendCommand: CommandSyntax = {
  "command": "append",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "append"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  },
  "category": "results::append",
  "description": "Append the results of a subsearch as additional results at the end of the current results.",
  "related": [
    "appendcols",
    "join",
    "set"
  ],
  "tags": [
    "append",
    "join",
    "combine",
    "unite",
    "combine"
  ]
};

/**
 * appendcols command
 *
 * Category: fields::add
 * Description: Appends fields of the results of the subsearch into input search results by combining the external fields of the subsearch (fields that do not start with '_') into the current results.  The first subsearch result is merged with the first main result, the second with the second, and so on.  If option override is false (default), if a field is present in both a subsearch result and the main result, the main result is used.  If it is true, the subsearch result's value for that field is used.
 */
export const appendcolsCommand: CommandSyntax = {
  "command": "appendcols",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "appendcols"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "alternation",
          "options": [
            {
              "kind": "param",
              "type": "bool",
              "name": "override"
            },
            {
              "kind": "param",
              "type": "field",
              "effect": "creates"
            }
          ]
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "creates"
      }
    ]
  },
  "category": "fields::add",
  "description": "Appends fields of the results of the subsearch into input search results by combining the external fields of the subsearch (fields that do not start with '_') into the current results.  The first subsearch result is merged with the first main result, the second with the second, and so on.  If option override is false (default), if a field is present in both a subsearch result and the main result, the main result is used.  If it is true, the subsearch result's value for that field is used.",
  "related": [
    "append",
    "join",
    "set"
  ],
  "tags": [
    "append",
    "join",
    "combine",
    "unite"
  ]
};

/**
 * arules command
 *
 * Category: streaming, reporting
 * Description: Finding association rules between values. This is the algorithm behind most online  shopping websites. When a customer buys an item, these sites are able to recommend related items that other customers also buy when they buy the first one. Arules finds such relationships and not only for shopping items but any kinds of fields. Note that stricly speaking, arules does not find relationships between fields, but rather between the values of the fields.
 */
export const arulesCommand: CommandSyntax = {
  "command": "arules",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "arules"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "effect": "consumes"
        },
        "quantifier": "*"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      }
    ]
  },
  "category": "streaming, reporting",
  "description": "Finding association rules between values. This is the algorithm behind most online  shopping websites. When a customer buys an item, these sites are able to recommend related items that other customers also buy when they buy the first one. Arules finds such relationships and not only for shopping items but any kinds of fields. Note that stricly speaking, arules does not find relationships between fields, but rather between the values of the fields.",
  "related": [
    "associate",
    "correlate"
  ],
  "tags": [
    "associate",
    "contingency",
    "correlate",
    "correspond",
    "dependence",
    "independence"
  ]
};

/**
 * associate command
 *
 * Category: reporting
 * Description: Searches for relationships between pairs of fields.  More specifically, this command tries to identify  cases where the entropy of field1 decreases significantly based on the condition of field2=value2. field1 is known as the target key and field2 the reference key and value2 the reference value. If a list of fields is provided, analysis will be restrict to only those fields.  By default all fields are used.
 */
export const associateCommand: CommandSyntax = {
  "command": "associate",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "associate"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "effect": "consumes"
        },
        "quantifier": "*"
      },
      {
        "kind": "param",
        "type": "field-list",
        "quantifier": "?",
        "effect": "consumes"
      }
    ]
  },
  "category": "reporting",
  "description": "Searches for relationships between pairs of fields.  More specifically, this command tries to identify  cases where the entropy of field1 decreases significantly based on the condition of field2=value2. field1 is known as the target key and field2 the reference key and value2 the reference value. If a list of fields is provided, analysis will be restrict to only those fields.  By default all fields are used.",
  "related": [
    "correlate",
    "contingency"
  ],
  "tags": [
    "associate",
    "contingency",
    "correlate",
    "connect",
    "link",
    "correspond",
    "dependence",
    "independence"
  ]
};

/**
 * audit command
 *
 * Category: administrative
 * Description: View audit trail information stored in the local "audit" index. Also validate signed audit events while checking for gaps and tampering.
 */
export const auditCommand: CommandSyntax = {
  "command": "audit",
  "syntax": {
    "kind": "literal",
    "value": "audit"
  },
  "category": "administrative",
  "description": "View audit trail information stored in the local \"audit\" index. Also validate signed audit events while checking for gaps and tampering.",
  "related": [
    "metadata"
  ],
  "tags": [
    "audit",
    "trail",
    "security"
  ]
};

/**
 * autoregress command
 *
 * Category: reporting
 * Description: Sets up data for auto-regression (e.g. moving average) by copying one or more of the previous values for <field> into each event.  If <newfield> is provided, one prior value will be copied into <newfield> from a count of 'p' events prior.  In this case, 'p' must be a single integer.  If <newfield> is not provided, the single or multiple values will be copied into fields named '<field>_p<p-val>'.  In this case 'p' may be a single integer, or a range <p_start>-<p_end>.  For a range, the values will be copied from 'p_start' events prior to 'p_end' events prior.  If 'p' option is unspecified, it defaults to 1 (i.e., copy only the previous one value of <field> into <field>_p1.  The first few events will lack previous values, since they do not exist.
 */
export const autoregressCommand: CommandSyntax = {
  "command": "autoregress",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "autoregress"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "literal",
              "value": "AS"
            },
            {
              "kind": "param",
              "type": "field",
              "effect": "consumes"
            }
          ]
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "param",
              "type": "field",
              "name": "p",
              "effect": "consumes"
            },
            {
              "kind": "group",
              "pattern": {
                "kind": "sequence",
                "patterns": [
                  {
                    "kind": "literal",
                    "value": "-"
                  },
                  {
                    "kind": "param",
                    "type": "field",
                    "effect": "consumes"
                  }
                ]
              },
              "quantifier": "?"
            }
          ]
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "reporting",
  "description": "Sets up data for auto-regression (e.g. moving average) by copying one or more of the previous values for <field> into each event.  If <newfield> is provided, one prior value will be copied into <newfield> from a count of 'p' events prior.  In this case, 'p' must be a single integer.  If <newfield> is not provided, the single or multiple values will be copied into fields named '<field>_p<p-val>'.  In this case 'p' may be a single integer, or a range <p_start>-<p_end>.  For a range, the values will be copied from 'p_start' events prior to 'p_end' events prior.  If 'p' option is unspecified, it defaults to 1 (i.e., copy only the previous one value of <field> into <field>_p1.  The first few events will lack previous values, since they do not exist.",
  "related": [
    "accum",
    "delta",
    "streamstats",
    "trendline"
  ],
  "tags": [
    "average",
    "mean"
  ]
};

/**
 * bin command
 *
 * Category: reporting
 * Description: Puts continuous numerical field values into discrete sets, or bins. Adjusts the value of 'field', so that all items in the set have the same value for 'field'.  Note: Bin is called by chart and timechart automatically and is only needed for statistical operations that timechart and chart cannot process.
 */
export const binCommand: CommandSyntax = {
  "command": "bin",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "bin"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "effect": "consumes"
        },
        "quantifier": "*"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "literal",
              "value": "as"
            },
            {
              "kind": "param",
              "type": "field",
              "effect": "consumes"
            }
          ]
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "reporting",
  "description": "Puts continuous numerical field values into discrete sets, or bins. Adjusts the value of 'field', so that all items in the set have the same value for 'field'.  Note: Bin is called by chart and timechart automatically and is only needed for statistical operations that timechart and chart cannot process.",
  "related": [
    "chart",
    "timechart"
  ],
  "tags": [
    "bucket",
    "band",
    "bracket",
    "bin",
    "round",
    "chunk",
    "lump",
    "span"
  ]
};

/**
 * bucketdir command
 *
 * Category: results::group
 * Description: Returns at most MAXCOUNT events by taking the incoming events and rolling up multiple sources into directories, by preferring directories that have many files but few events.  The field with the path is PATHFIELD (e.g., source), and strings are broken up by a SEP character.  The default pathfield=source; sizefield=totalCount; maxcount=20; countfield=totalCount; sep="/" or "\\", depending on the os.
 */
export const bucketdirCommand: CommandSyntax = {
  "command": "bucketdir",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "bucketdir"
      },
      {
        "kind": "param",
        "type": "field",
        "name": "pathfield"
      },
      {
        "kind": "param",
        "type": "field",
        "name": "sizefield"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "maxcount"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "countfield"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "sep"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "results::group",
  "description": "Returns at most MAXCOUNT events by taking the incoming events and rolling up multiple sources into directories, by preferring directories that have many files but few events.  The field with the path is PATHFIELD (e.g., source), and strings are broken up by a SEP character.  The default pathfield=source; sizefield=totalCount; maxcount=20; countfield=totalCount; sep=\"/\" or \"\\\\\", depending on the os.",
  "related": [
    "cluster dedup"
  ],
  "tags": [
    "cluster",
    "group",
    "collect",
    "gather"
  ]
};

/**
 * chart command
 *
 * Category: reporting
 * Description: Creates a table of statistics suitable for charting.  Whereas timechart generates a  chart with _time as the x-axis, chart lets you select an arbitrary field as the x-axis with the "by" or "over" keyword. If necessary, the x-axis field is converted to discrete numerical quantities.\p\ When chart includes a split-by-clause, the columns in the output table represents a distinct value of the split-by-field. (With stats, each row represents a single unique combination of values of the group-by-field. The table displays ten columns by default, but you can specify a where clause to adjust the number of columns.\p\ When a where clause is not provided, you can use limit and agg options to specify series filtering. If limit=0, there is no series filtering. \p\ When specifying multiple data series with a split-by-clause, you can use sep and format options to construct output field names.
 */
export const chartCommand: CommandSyntax = {
  "command": "chart",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "chart"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      }
    ]
  },
  "category": "reporting",
  "description": "Creates a table of statistics suitable for charting.  Whereas timechart generates a  chart with _time as the x-axis, chart lets you select an arbitrary field as the x-axis with the \"by\" or \"over\" keyword. If necessary, the x-axis field is converted to discrete numerical quantities.\\p\\ When chart includes a split-by-clause, the columns in the output table represents a distinct value of the split-by-field. (With stats, each row represents a single unique combination of values of the group-by-field. The table displays ten columns by default, but you can specify a where clause to adjust the number of columns.\\p\\ When a where clause is not provided, you can use limit and agg options to specify series filtering. If limit=0, there is no series filtering. \\p\\ When specifying multiple data series with a split-by-clause, you can use sep and format options to construct output field names.",
  "related": [
    "timechart",
    "bucket",
    "sichart"
  ],
  "tags": [
    "chart",
    "graph",
    "report",
    "sparkline",
    "count",
    "dc",
    "mean",
    "avg",
    "stdev",
    "var",
    "min",
    "max",
    "mode",
    "median"
  ]
};

/**
 * cluster command
 *
 * Category: results::group
 * Description: Fast and simple clustering method designed to operate on event text (_raw field).  With default options, a single representative event is retained for each cluster.
 */
export const clusterCommand: CommandSyntax = {
  "command": "cluster",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "cluster"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "*"
      }
    ]
  },
  "category": "results::group",
  "description": "Fast and simple clustering method designed to operate on event text (_raw field).  With default options, a single representative event is retained for each cluster.",
  "related": [
    "anomalies",
    "anomalousvalue",
    "cluster",
    "kmeans",
    "outlier"
  ],
  "tags": [
    "cluster",
    "group",
    "collect",
    "gather"
  ]
};

/**
 * cofilter command
 *
 * Category: streaming, reporting
 * Description: For this command, we think of field1 values as "users" and field2 values as "items".  The goal of the command is to compute, for each pair of item (i.e., field2 values), how many users (i.e., field1 values) used them both (i.e., occurred with each of them).
 */
export const cofilterCommand: CommandSyntax = {
  "command": "cofilter",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "cofilter"
      },
      {
        "kind": "literal",
        "value": "field1"
      },
      {
        "kind": "literal",
        "value": "field2"
      }
    ]
  },
  "category": "streaming, reporting",
  "description": "For this command, we think of field1 values as \"users\" and field2 values as \"items\".  The goal of the command is to compute, for each pair of item (i.e., field2 values), how many users (i.e., field1 values) used them both (i.e., occurred with each of them).",
  "related": [
    "associate",
    "correlate"
  ],
  "tags": [
    "arules",
    "associate",
    "contingency",
    "correlate",
    "correspond",
    "dependence",
    "independence"
  ]
};

/**
 * collapse command
 *
 * Category: unknown
 * Description: Purely internal operation that condenses multi-file results into as few files as chunksize option will allow.  (default chunksize=50000).  Operation automatically invoked by output* operators.  If force=true and the results are entirely in memory, re-divide the results into appropriated chunked files (this option is new for 5.0).
 */
export const collapseCommand: CommandSyntax = {
  "command": "collapse",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "collapse"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "num",
          "name": "chunksize"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "force"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "unknown",
  "description": "Purely internal operation that condenses multi-file results into as few files as chunksize option will allow.  (default chunksize=50000).  Operation automatically invoked by output* operators.  If force=true and the results are entirely in memory, re-divide the results into appropriated chunked files (this option is new for 5.0).",
  "related": [],
  "tags": []
};

/**
 * collect command
 *
 * Category: index::summary
 * Description: Adds the results of the search into the specified index. Behind the scenes, the events are written  to a file whose name format is: "<random-num>_events.stash", unless overridden, in a directory which is watched for new events by Splunk. If the events contain a _raw field then the raw field is saved, if they don't a _raw field is constructed by concatenating all the fields into a comma-separated list of key="value" pairs.
 */
export const collectCommand: CommandSyntax = {
  "command": "collect",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "collect"
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "*"
      }
    ]
  },
  "category": "index::summary",
  "description": "Adds the results of the search into the specified index. Behind the scenes, the events are written  to a file whose name format is: \"<random-num>_events.stash\", unless overridden, in a directory which is watched for new events by Splunk. If the events contain a _raw field then the raw field is saved, if they don't a _raw field is constructed by concatenating all the fields into a comma-separated list of key=\"value\" pairs.",
  "related": [
    "overlap",
    "sichart",
    "sirare",
    "sistats",
    "sitop",
    "sitimechart"
  ],
  "tags": [
    "collect",
    "summary",
    "overlap",
    "summary",
    "index",
    "summaryindex"
  ]
};

/**
 * concurrency command
 *
 * Category: reporting
 * Description: If each event represents something that occurs over a span of time, where that  span is specified in the duration field, calculate the number of concurrent events for each event start time.  An event X is concurrent with event Y if the X start time, X.start, lies between Y.start and (Y.start + Y.duration). In other words, the concurrent set of events is calculated for each event start time, and that number is attached to the event. The units of start and duration are assumed to be the same.  If you have different units, you will need to convert them to corresponding units prior to using the concurrency command. Unless specified, the start field is assumed to be _time and the output field will be 'concurrency' Limits: If concurrency exceeds limits.conf [concurrency] max_count (Defaults to 10 million), results will not be accurate.
 */
export const concurrencyCommand: CommandSyntax = {
  "command": "concurrency",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "concurrency"
      },
      {
        "kind": "param",
        "type": "field",
        "name": "duration",
        "effect": "consumes"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "start",
          "effect": "consumes"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "output",
          "effect": "consumes"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "reporting",
  "description": "If each event represents something that occurs over a span of time, where that  span is specified in the duration field, calculate the number of concurrent events for each event start time.  An event X is concurrent with event Y if the X start time, X.start, lies between Y.start and (Y.start + Y.duration). In other words, the concurrent set of events is calculated for each event start time, and that number is attached to the event. The units of start and duration are assumed to be the same.  If you have different units, you will need to convert them to corresponding units prior to using the concurrency command. Unless specified, the start field is assumed to be _time and the output field will be 'concurrency' Limits: If concurrency exceeds limits.conf [concurrency] max_count (Defaults to 10 million), results will not be accurate.",
  "related": [
    "timechart"
  ],
  "tags": [
    "concurrency"
  ]
};

/**
 * contingency command
 *
 * Category: reporting
 * Description: In statistics, contingency tables are used to record  and analyze the relationship between two or more (usually categorical) variables.  Many metrics of association or independence can be calculated based on contingency tables, such as the phi coefficient or the V of Cramer.
 */
export const contingencyCommand: CommandSyntax = {
  "command": "contingency",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "contingency"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "effect": "consumes"
        },
        "quantifier": "*"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      }
    ]
  },
  "category": "reporting",
  "description": "In statistics, contingency tables are used to record  and analyze the relationship between two or more (usually categorical) variables.  Many metrics of association or independence can be calculated based on contingency tables, such as the phi coefficient or the V of Cramer.",
  "related": [
    "associate",
    "correlate"
  ],
  "tags": [
    "associate",
    "contingency",
    "correlate",
    "connect",
    "link",
    "correspond",
    "dependence",
    "independence"
  ]
};

/**
 * convert command
 *
 * Category: fields::convert
 * Description: Converts the values of fields into numerical values. When renaming a field using "as", the original field is left intact. The timeformat option is used by ctime and mktime conversions.  Default = "%m/%d/%Y %H:%M:%S".
 */
export const convertCommand: CommandSyntax = {
  "command": "convert",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "convert"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "timeformat"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "param",
              "type": "field"
            },
            {
              "kind": "group",
              "pattern": {
                "kind": "sequence",
                "patterns": [
                  {
                    "kind": "literal",
                    "value": "as"
                  },
                  {
                    "kind": "param",
                    "type": "wc-field"
                  }
                ]
              },
              "quantifier": "?"
            }
          ]
        },
        "quantifier": "+"
      }
    ]
  },
  "category": "fields::convert",
  "description": "Converts the values of fields into numerical values. When renaming a field using \"as\", the original field is left intact. The timeformat option is used by ctime and mktime conversions.  Default = \"%m/%d/%Y %H:%M:%S\".",
  "related": [
    "eval"
  ],
  "tags": [
    "interchange",
    "transform",
    "translate",
    "convert",
    "ctime",
    "mktime",
    "dur2sec",
    "mstime",
    "memk"
  ]
};

/**
 * copyresults command
 *
 * Category: unknown
 * Description: Copies the results of a search to a specified location within the config directory structure. This command is primarily used to populate lookup tables.
 */
export const copyresultsCommand: CommandSyntax = {
  "command": "copyresults",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "copyresults"
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  },
  "category": "unknown",
  "description": "Copies the results of a search to a specified location within the config directory structure. This command is primarily used to populate lookup tables.",
  "related": [],
  "tags": []
};

/**
 * correlate command
 *
 * Category: reporting
 * Description: Calculates a co-occurrence matrix, which contains the percentage of times that two  fields exist in the same events.  The RowField field contains the name of the field considered for the row, while the other column names (fields) are the fields it is being compared against. Values are the ratio of occurrences when both fields appeared to occurrences when only one field appeared.
 */
export const correlateCommand: CommandSyntax = {
  "command": "correlate",
  "syntax": {
    "kind": "literal",
    "value": "correlate"
  },
  "category": "reporting",
  "description": "Calculates a co-occurrence matrix, which contains the percentage of times that two  fields exist in the same events.  The RowField field contains the name of the field considered for the row, while the other column names (fields) are the fields it is being compared against. Values are the ratio of occurrences when both fields appeared to occurrences when only one field appeared.",
  "related": [
    "associate",
    "contingency"
  ],
  "tags": [
    "associate",
    "contingency",
    "correlate",
    "connect",
    "link",
    "correspond",
    "dependence",
    "independence"
  ]
};

/**
 * createrss command
 *
 * Category: alerting
 * Description: If the RSS feed does not exist, it creates one. The arguments are as follow \i\ PATH  - the path of the rss feed (no ../ allowed) can be accessed via http://splunk/rss/path    \i\ NAME  - the name/title of the rss item to add \i\ LINK  - link where the rss item points to \i\ DESCR - the description field of the rss item \i\ COUNT - maximum number of items in the rss feed when reached last items is dropped \i\ GRACEFUL - (optional) controls whether on error an exception is raised or simply logged - this is \i\ useful when you don't want createrss to break the search pipeline
 */
export const createrssCommand: CommandSyntax = {
  "command": "createrss",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "createrss"
      },
      {
        "kind": "param",
        "type": "string",
        "name": "path"
      },
      {
        "kind": "param",
        "type": "string",
        "name": "name"
      },
      {
        "kind": "param",
        "type": "string",
        "name": "link"
      },
      {
        "kind": "param",
        "type": "string",
        "name": "descr"
      },
      {
        "kind": "param",
        "type": "int",
        "name": "count"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "graceful"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "alerting",
  "description": "If the RSS feed does not exist, it creates one. The arguments are as follow \\i\\ PATH  - the path of the rss feed (no ../ allowed) can be accessed via http://splunk/rss/path    \\i\\ NAME  - the name/title of the rss item to add \\i\\ LINK  - link where the rss item points to \\i\\ DESCR - the description field of the rss item \\i\\ COUNT - maximum number of items in the rss feed when reached last items is dropped \\i\\ GRACEFUL - (optional) controls whether on error an exception is raised or simply logged - this is \\i\\ useful when you don't want createrss to break the search pipeline",
  "related": [
    "sendemail"
  ],
  "tags": []
};

/**
 * datamodel command
 *
 * Category: results::filter
 * Description: Must be the first command in a search. When used with no  arguments, returns the JSON for all data models available in the current context. When used with just a modelName, returns the JSON for a single data model. When used with a modelName and objectName, returns the JSON for a single data model dataset. When used with modelName, objectName and 'dm-search-mode', runs the search for the specified search mode.
 */
export const datamodelCommand: CommandSyntax = {
  "command": "datamodel",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "datamodel"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "results::filter",
  "description": "Must be the first command in a search. When used with no  arguments, returns the JSON for all data models available in the current context. When used with just a modelName, returns the JSON for a single data model. When used with a modelName and objectName, returns the JSON for a single data model dataset. When used with modelName, objectName and 'dm-search-mode', runs the search for the specified search mode.",
  "related": [
    "from",
    "pivot"
  ],
  "tags": [
    "datamodel",
    "model",
    "pivot"
  ]
};

/**
 * dbinspect command
 *
 * Category: administrative
 * Description: Returns information about the buckets in the Splunk Enterprise index.  The Splunk Enterprise index is the repository for data from Splunk Enterprise. As incoming data is indexed, or transformed into events, Splunk Enterprise creates files of rawdata and metadata (index files). The files reside in sets of directories organized by age. These directories are called buckets. When invoked without the bin-span option, information about the buckets is returned in the following fields: bucketId, endEpoch, eventCount, guID, hostCount, id, index, modTime, path, rawSize, sizeOnDiskMB, sourceCount, sourceTypeCount, splunk_server, startEpoch, state, corruptReason. The corruptReason field only appears when corruptonly=true. \p\ When invoked with a bin span, a table of the spans of each bucket is returned.
 */
export const dbinspectCommand: CommandSyntax = {
  "command": "dbinspect",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "dbinspect"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "*"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "alternation",
          "options": [
            {
              "kind": "param",
              "type": "field"
            },
            {
              "kind": "param",
              "type": "field"
            }
          ]
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "corruptonly"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "administrative",
  "description": "Returns information about the buckets in the Splunk Enterprise index.  The Splunk Enterprise index is the repository for data from Splunk Enterprise. As incoming data is indexed, or transformed into events, Splunk Enterprise creates files of rawdata and metadata (index files). The files reside in sets of directories organized by age. These directories are called buckets. When invoked without the bin-span option, information about the buckets is returned in the following fields: bucketId, endEpoch, eventCount, guID, hostCount, id, index, modTime, path, rawSize, sizeOnDiskMB, sourceCount, sourceTypeCount, splunk_server, startEpoch, state, corruptReason. The corruptReason field only appears when corruptonly=true. \\p\\ When invoked with a bin span, a table of the spans of each bucket is returned.",
  "related": [
    "metadata"
  ],
  "tags": [
    "inspect",
    "index",
    "bucket"
  ]
};

/**
 * debug command
 *
 * Category: unknown
 * Description: This search command can be used to issue debug commands to the system.
 */
export const debugCommand: CommandSyntax = {
  "command": "debug",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "debug"
      },
      {
        "kind": "param",
        "type": "field",
        "name": "cmd"
      },
      {
        "kind": "param",
        "type": "string",
        "name": "param1"
      },
      {
        "kind": "param",
        "type": "string",
        "name": "param2"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  },
  "category": "unknown",
  "description": "This search command can be used to issue debug commands to the system.",
  "related": [],
  "tags": [
    "debug",
    "roll"
  ]
};

/**
 * dedup command
 *
 * Category: results::filter
 * Description: Keep the first N (where N > 0) results for each combination of values for the specified field(s)  The first argument, if a number, is interpreted as N.  If this number is absent, N is assumed to be 1. The optional sortby clause is equivalent to performing a sort command before the dedup command except that it is executed more efficiently.  The keepevents flag will keep all events, but for events with duplicate values, remove those fields values instead of the entire event. \p\ Normally, events with a null value in any of the fields are dropped.  The keepempty flag will retain all events with a null value in any of the fields.
 */
export const dedupCommand: CommandSyntax = {
  "command": "dedup",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "dedup"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int"
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field-list"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "literal",
              "value": "sortby"
            },
            {
              "kind": "param",
              "type": "field"
            }
          ]
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "results::filter",
  "description": "Keep the first N (where N > 0) results for each combination of values for the specified field(s)  The first argument, if a number, is interpreted as N.  If this number is absent, N is assumed to be 1. The optional sortby clause is equivalent to performing a sort command before the dedup command except that it is executed more efficiently.  The keepevents flag will keep all events, but for events with duplicate values, remove those fields values instead of the entire event. \\p\\ Normally, events with a null value in any of the fields are dropped.  The keepempty flag will retain all events with a null value in any of the fields.",
  "related": [
    "uniq"
  ],
  "tags": [
    "duplicate",
    "redundant",
    "extra"
  ]
};

/**
 * delete command
 *
 * Category: unknown
 * Description: Piping a search to the delete operator marks all the events returned by that search so that they are never returned by any later search. No user (even with admin permissions) will be able to see this data using Splunk.  The delete operator can only be accessed by a user with the "delete_by_keyword" capability. By default, Splunk ships with a special role, "can_delete" that has this capability (and no others). The admin role does not have this capability by default. Splunk recommends you create a special user that you log into when you intend to delete index data. To use the delete operator, run a search that returns the events you want deleted. Make sure that this search ONLY returns events you want to delete, and no other events. Once you've confirmed that this is the data you want to delete, pipe that search to delete. Note: The delete operator will trigger a roll of hot buckets to warm in the affected index(es).
 */
export const deleteCommand: CommandSyntax = {
  "command": "delete",
  "syntax": {
    "kind": "literal",
    "value": "delete"
  },
  "category": "unknown",
  "description": "Piping a search to the delete operator marks all the events returned by that search so that they are never returned by any later search. No user (even with admin permissions) will be able to see this data using Splunk.  The delete operator can only be accessed by a user with the \"delete_by_keyword\" capability. By default, Splunk ships with a special role, \"can_delete\" that has this capability (and no others). The admin role does not have this capability by default. Splunk recommends you create a special user that you log into when you intend to delete index data. To use the delete operator, run a search that returns the events you want deleted. Make sure that this search ONLY returns events you want to delete, and no other events. Once you've confirmed that this is the data you want to delete, pipe that search to delete. Note: The delete operator will trigger a roll of hot buckets to warm in the affected index(es).",
  "related": [],
  "tags": [
    "delete",
    "hide"
  ]
};

/**
 * delta command
 *
 * Category: fields::add
 * Description: For each event where <field> is a number, compute the difference, in search order, between the current event's value of <field> and a previous event's value of <field> and write this difference into <field:newfield>.  If <newfield> if not specified, it defaults to "delta(<field>)"   If p is unspecified, the default = 1, meaning the the immediate previous value is used.  p=2 would mean that the value before the previous value is used, etc etc etc.
 */
export const deltaCommand: CommandSyntax = {
  "command": "delta",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "delta"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "creates"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "literal",
              "value": "as"
            },
            {
              "kind": "param",
              "type": "field",
              "effect": "creates"
            }
          ]
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "p"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "fields::add",
  "description": "For each event where <field> is a number, compute the difference, in search order, between the current event's value of <field> and a previous event's value of <field> and write this difference into <field:newfield>.  If <newfield> if not specified, it defaults to \"delta(<field>)\"   If p is unspecified, the default = 1, meaning the the immediate previous value is used.  p=2 would mean that the value before the previous value is used, etc etc etc.",
  "related": [
    "accum",
    "autoregress",
    "streamstats",
    "trendline"
  ],
  "tags": [
    "difference",
    "delta",
    "change",
    "distance"
  ]
};

/**
 * diff command
 *
 * Category: formatting
 * Description: Compares a field from two search results, returning the line-by-line 'diff' of the two.  The two search results compared is specified by the two position values (position1 and position2), hich default to 1 and 2 (i.e., compare the first two results).  \p\ By default, the text of the two search results (i.e., the "_raw" field) are compared, but other fields can be compared, using 'attribute'.  \p\ If 'diffheader' is true, the traditional diff headers are created using the source keys of the two events as filenames. 'diffheader' defaults to false.  \p\ If 'context' is true, the output is generated in context-diff format.  Otherwise, unified diff format is used. 'context' defaults to false (unified). \p\ If 'maxlen' is provided, it controls the maximum content in bytes diffed from the two events. It defaults to 100000, meaning 100KB, if maxlen=0, there is no limit.
 */
export const diffCommand: CommandSyntax = {
  "command": "diff",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "diff"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "position1"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "position2"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "attribute"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "diffheader"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "context"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "maxlen"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "formatting",
  "description": "Compares a field from two search results, returning the line-by-line 'diff' of the two.  The two search results compared is specified by the two position values (position1 and position2), hich default to 1 and 2 (i.e., compare the first two results).  \\p\\ By default, the text of the two search results (i.e., the \"_raw\" field) are compared, but other fields can be compared, using 'attribute'.  \\p\\ If 'diffheader' is true, the traditional diff headers are created using the source keys of the two events as filenames. 'diffheader' defaults to false.  \\p\\ If 'context' is true, the output is generated in context-diff format.  Otherwise, unified diff format is used. 'context' defaults to false (unified). \\p\\ If 'maxlen' is provided, it controls the maximum content in bytes diffed from the two events. It defaults to 100000, meaning 100KB, if maxlen=0, there is no limit.",
  "related": [
    "set"
  ],
  "tags": [
    "diff",
    "differentiate",
    "distinguish",
    "contrast"
  ]
};

/**
 * dump command
 *
 * Category: exporting
 * Description: Runs a given search query and exports events to a set of chunk files on local disk.  This command runs a specified search query and oneshot export search results to local disk at "$SPLUNK_HOME/var/run/splunk/dispatch/&lt;sid&gt;/dump". It recognizes a special field in the input events, _dstpath, which if set will be used as a path to be appended to dst to compute final destination path. \i\ "basefilename"       - prefix of the export filename. \i\ "rollsize"           - minimum file size at which point no more events are written to the file and \i\ it becomes a candidate for HDFS transfer, unit is "MB", default "64MB". \i\ "compress"           - gzip compression level from 0 to 9, 0 means no compression, higher number \i\ means more compression and slower writing speed, default 2. \i\ "format"             - output data format, supported values are raw | csv | tsv | json | xml \i\ "fields"             - list of splunk event fields exported to export data, invalid fields will be ignored \i\
 */
export const dumpCommand: CommandSyntax = {
  "command": "dump",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "dump"
      },
      {
        "kind": "param",
        "type": "string",
        "name": "basefilename"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "num",
          "name": "rollsize"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "compress"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "format"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "fields"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "exporting",
  "description": "Runs a given search query and exports events to a set of chunk files on local disk.  This command runs a specified search query and oneshot export search results to local disk at \"$SPLUNK_HOME/var/run/splunk/dispatch/&lt;sid&gt;/dump\". It recognizes a special field in the input events, _dstpath, which if set will be used as a path to be appended to dst to compute final destination path. \\i\\ \"basefilename\"       - prefix of the export filename. \\i\\ \"rollsize\"           - minimum file size at which point no more events are written to the file and \\i\\ it becomes a candidate for HDFS transfer, unit is \"MB\", default \"64MB\". \\i\\ \"compress\"           - gzip compression level from 0 to 9, 0 means no compression, higher number \\i\\ means more compression and slower writing speed, default 2. \\i\\ \"format\"             - output data format, supported values are raw | csv | tsv | json | xml \\i\\ \"fields\"             - list of splunk event fields exported to export data, invalid fields will be ignored \\i\\",
  "related": [],
  "tags": []
};

/**
 * erex command
 *
 * Category: fields::add
 * Description: Example-based regular expression  extraction. Automatically extracts field values from FROMFIELD (defaults to _raw) that are similar to the EXAMPLES (comma-separated list of example values) and puts them in FIELD. An informational message is output with the resulting regular expression. That expression can then be used with the REX command for more efficient extraction.  To learn the extraction rule for pulling out example values, it learns from at most MAXTRAINERS (defaults to 100, must be between 1-1000).
 */
export const erexCommand: CommandSyntax = {
  "command": "erex",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "erex"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "creates"
      },
      {
        "kind": "param",
        "type": "field",
        "name": "examples",
        "effect": "creates"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "counterexamples",
          "effect": "creates"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "fromfield",
          "effect": "creates"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "maxtrainers"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "fields::add",
  "description": "Example-based regular expression  extraction. Automatically extracts field values from FROMFIELD (defaults to _raw) that are similar to the EXAMPLES (comma-separated list of example values) and puts them in FIELD. An informational message is output with the resulting regular expression. That expression can then be used with the REX command for more efficient extraction.  To learn the extraction rule for pulling out example values, it learns from at most MAXTRAINERS (defaults to 100, must be between 1-1000).",
  "related": [
    "extract",
    "kvform",
    "multikv",
    "regex",
    "rex",
    "xmlkv"
  ],
  "tags": [
    "regex",
    "regular",
    "expression",
    "extract"
  ]
};

/**
 * eventcount command
 *
 * Category: reporting
 * Description: Returns the number of events in an index.  By default, it summarizes the events across all peers and indexes (summarize is True by default).  If summarize is False, it splits the event count by index and search peer.  If report_size is True (it defaults to False), then it will also report the index size in bytes. If list_vix is False (it defaults to True) then virtual indexes will not be listed.
 */
export const eventcountCommand: CommandSyntax = {
  "command": "eventcount",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "eventcount"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "effect": "consumes"
        },
        "quantifier": "*"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "summarize"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "report_size"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "list_vix"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "reporting",
  "description": "Returns the number of events in an index.  By default, it summarizes the events across all peers and indexes (summarize is True by default).  If summarize is False, it splits the event count by index and search peer.  If report_size is True (it defaults to False), then it will also report the index size in bytes. If list_vix is False (it defaults to True) then virtual indexes will not be listed.",
  "related": [],
  "tags": [
    "count",
    "eventcount"
  ]
};

/**
 * eventstats command
 *
 * Category: reporting
 * Description: Generate summary statistics of all existing fields in your search results and save them as values in new fields. Specify a new field name for the statistics results by using the as argument. If you don't specify a new field name, the default field name is the statistical operator and the field it operated on (for example: stat-operator(field)). Just like the 'stats' command except that aggregation results are added inline to each event, and only the aggregations that are pertinent to that event.  The 'allnum' option has the same meaning as that option in the stats command.  See stats-command for detailed descriptions of syntax.
 */
export const eventstatsCommand: CommandSyntax = {
  "command": "eventstats",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "eventstats"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "allnum"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "effect": "consumes"
        },
        "quantifier": "*"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "effect": "consumes"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "reporting",
  "description": "Generate summary statistics of all existing fields in your search results and save them as values in new fields. Specify a new field name for the statistics results by using the as argument. If you don't specify a new field name, the default field name is the statistical operator and the field it operated on (for example: stat-operator(field)). Just like the 'stats' command except that aggregation results are added inline to each event, and only the aggregations that are pertinent to that event.  The 'allnum' option has the same meaning as that option in the stats command.  See stats-command for detailed descriptions of syntax.",
  "related": [
    "stats"
  ],
  "tags": [
    "stats",
    "statistics",
    "event"
  ]
};

/**
 * extract command
 *
 * Category: fields::add
 * Description: Forces field-value extraction on the result set.
 */
export const extractCommand: CommandSyntax = {
  "command": "extract",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "extract"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "*",
        "effect": "creates"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "*",
        "effect": "creates"
      }
    ]
  },
  "category": "fields::add",
  "description": "Forces field-value extraction on the result set.",
  "related": [
    "kvform",
    "multikv",
    "rex",
    "xmlkv"
  ],
  "tags": [
    "extract",
    "kv",
    "field",
    "extract"
  ]
};

/**
 * fields command
 *
 * Category: fields::filter
 * Description: Keeps or removes fields based on the field list criteria.  If "+" is specified, only the fields that match one of the fields in the list are kept. If "-" is specified, only the fields that match one of the fields in the list are removed.
 */
export const fieldsCommand: CommandSyntax = {
  "command": "fields",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "fields"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "alternation",
          "options": [
            {
              "kind": "literal",
              "value": "+"
            },
            {
              "kind": "literal",
              "value": "-"
            }
          ]
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      }
    ]
  },
  "category": "fields::filter",
  "description": "Keeps or removes fields based on the field list criteria.  If \"+\" is specified, only the fields that match one of the fields in the list are kept. If \"-\" is specified, only the fields that match one of the fields in the list are removed.",
  "related": [
    "rename"
  ],
  "tags": [
    "fields",
    "select",
    "columns"
  ]
};

/**
 * fieldsummary command
 *
 * Category: reporting
 * Description: Generates summary information for all or a subset of the fields.  Emits a maximum of maxvals distinct values for each field (default = 100).
 */
export const fieldsummaryCommand: CommandSyntax = {
  "command": "fieldsummary",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "fieldsummary"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "num",
          "name": "maxvals"
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?",
        "effect": "consumes"
      }
    ]
  },
  "category": "reporting",
  "description": "Generates summary information for all or a subset of the fields.  Emits a maximum of maxvals distinct values for each field (default = 100).",
  "related": [
    "af",
    "anomalies",
    "anomalousvalue",
    "stats"
  ],
  "tags": []
};

/**
 * file command
 *
 * Category: results::read
 * Description: If filename is a file, the file command will read the file as if it was indexed in Splunk. If filename is a directory, file will display the list of files in that directory with the option of adding those to the inputs.
 */
export const fileCommand: CommandSyntax = {
  "command": "file",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "file"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  },
  "category": "results::read",
  "description": "If filename is a file, the file command will read the file as if it was indexed in Splunk. If filename is a directory, file will display the list of files in that directory with the option of adding those to the inputs.",
  "related": [
    "inputcsv"
  ],
  "tags": [
    "file",
    "index",
    "read",
    "open",
    "preview",
    "test",
    "input"
  ]
};

/**
 * filldown command
 *
 * Category: fields::modify
 * Description: Replace null values with the last non-null value for a field or set of fields.  If no list of fields is given, filldown will be applied to all fields. If there were not any previous values for a field, it will be left blank (null).
 */
export const filldownCommand: CommandSyntax = {
  "command": "filldown",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "filldown"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "effect": "modifies"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "fields::modify",
  "description": "Replace null values with the last non-null value for a field or set of fields.  If no list of fields is given, filldown will be applied to all fields. If there were not any previous values for a field, it will be left blank (null).",
  "related": [
    "fillnull"
  ],
  "tags": [
    "empty",
    "default"
  ]
};

/**
 * fillnull command
 *
 * Category: fields::modify
 * Description: Replaces null values with a user specified value (default "0").  Null values are those missing in a particular result, but present for some other result.  If a field-list is provided, fillnull is applied to only fields in the given list (including any fields that does not exist at all).  Otherwise, applies to all existing fields.
 */
export const fillnullCommand: CommandSyntax = {
  "command": "fillnull",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "fillnull"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "value"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field-list",
          "effect": "modifies"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "fields::modify",
  "description": "Replaces null values with a user specified value (default \"0\").  Null values are those missing in a particular result, but present for some other result.  If a field-list is provided, fillnull is applied to only fields in the given list (including any fields that does not exist at all).  Otherwise, applies to all existing fields.",
  "related": [
    "eval"
  ],
  "tags": [
    "empty",
    "default"
  ]
};

/**
 * findkeywords command
 *
 * Category: reporting
 * Description: Typically run after the "cluster" command or similar.  Takes a set of results with a field  ("labelfield") that supplies a partition of the results into a set of groups. The command then derives a search to generate each of these groups, which may be saved as an event type if applicable.
 */
export const findkeywordsCommand: CommandSyntax = {
  "command": "findkeywords",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "findkeywords"
      },
      {
        "kind": "param",
        "type": "field",
        "name": "labelfield",
        "effect": "consumes"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "dedup"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "reporting",
  "description": "Typically run after the \"cluster\" command or similar.  Takes a set of results with a field  (\"labelfield\") that supplies a partition of the results into a set of groups. The command then derives a search to generate each of these groups, which may be saved as an event type if applicable.",
  "related": [
    "cluster findtypes"
  ],
  "tags": [
    "findkeywords",
    "cluster",
    "patterns",
    "findtypes"
  ]
};

/**
 * findtypes command
 *
 * Category: results::group
 * Description: Takes previous search results, and produces a list of promising searches that may be used as event types.  Returns up to MAX event types, defaulting to 10.  If the "notcovered" keyword is specified, then event types that are already covered by other eventtypes are not returned.  At most 5000 events are analyzed for discovering event types.  If the "useraw" keyword is specified, then phrases in the _raw text of the events is used for generating event types.
 */
export const findtypesCommand: CommandSyntax = {
  "command": "findtypes",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "findtypes"
      },
      {
        "kind": "param",
        "type": "int",
        "name": "max"
      },
      {
        "kind": "literal",
        "value": "notcovered",
        "quantifier": "?"
      },
      {
        "kind": "literal",
        "value": "useraw",
        "quantifier": "?"
      }
    ]
  },
  "category": "results::group",
  "description": "Takes previous search results, and produces a list of promising searches that may be used as event types.  Returns up to MAX event types, defaulting to 10.  If the \"notcovered\" keyword is specified, then event types that are already covered by other eventtypes are not returned.  At most 5000 events are analyzed for discovering event types.  If the \"useraw\" keyword is specified, then phrases in the _raw text of the events is used for generating event types.",
  "related": [
    "typer",
    "typelearner"
  ],
  "tags": [
    "eventtype",
    "typer",
    "discover",
    "search",
    "classify"
  ]
};

/**
 * folderize command
 *
 * Category: results::group
 * Description: Replaces the "attr" attribute value with a more generic value, which is the result of grouping it with other values from other results, where grouping happens via tokenizing the attr value on the sep separator value. For example, it can group search results, such as those used on the Splunk homepage to list hierarchical buckets (e.g. directories or categories). Rather than listing 200 sources on the Splunk homepage, folderize breaks the source strings by a separator (e.g. "/"), and determines if looking at just directories results in the number of results requested.  The default "sep" separator is "::"; the default size attribute is "totalCount"; the default "minfolders" is 2; and the default "maxfolders" is 20.
 */
export const folderizeCommand: CommandSyntax = {
  "command": "folderize",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "folderize"
      },
      {
        "kind": "param",
        "type": "string",
        "name": "attr"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "sep"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "size"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "minfolders"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "maxfolders"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "results::group",
  "description": "Replaces the \"attr\" attribute value with a more generic value, which is the result of grouping it with other values from other results, where grouping happens via tokenizing the attr value on the sep separator value. For example, it can group search results, such as those used on the Splunk homepage to list hierarchical buckets (e.g. directories or categories). Rather than listing 200 sources on the Splunk homepage, folderize breaks the source strings by a separator (e.g. \"/\"), and determines if looking at just directories results in the number of results requested.  The default \"sep\" separator is \"::\"; the default size attribute is \"totalCount\"; the default \"minfolders\" is 2; and the default \"maxfolders\" is 20.",
  "related": [
    "bucketdir"
  ],
  "tags": [
    "cluster",
    "group",
    "collect",
    "gather"
  ]
};

/**
 * foreach command
 *
 * Category: search::subsearch
 * Description: Run a templated streaming subsearch for each field in a wildcarded field list.  For each field that is matched, the templated subsearch will have the following patterns replaced:  \i\ option         default          replacement \i\ fieldstr       <<FIELD>>        whole field name \i\ matchstr       <<MATCHSTR>>     part of field name that matches wildcard(s) in the specifier \i\ matchseg1      <<MATCHSEG1>>    part of field name that matches first wildcard \i\ matchseg2      <<MATCHSEG2>>    part of field name that matches second wildcard \i\ matchseg3      <<MATCHSEG3>>    part of field name that matches third wildcard
 */
export const foreachCommand: CommandSyntax = {
  "command": "foreach",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "foreach"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "wc-field"
        },
        "quantifier": "+"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "fieldstr"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "matchstr"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "matchseg1"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "matchseg2"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "matchseg3"
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  },
  "category": "search::subsearch",
  "description": "Run a templated streaming subsearch for each field in a wildcarded field list.  For each field that is matched, the templated subsearch will have the following patterns replaced:  \\i\\ option         default          replacement \\i\\ fieldstr       <<FIELD>>        whole field name \\i\\ matchstr       <<MATCHSTR>>     part of field name that matches wildcard(s) in the specifier \\i\\ matchseg1      <<MATCHSEG1>>    part of field name that matches first wildcard \\i\\ matchseg2      <<MATCHSEG2>>    part of field name that matches second wildcard \\i\\ matchseg3      <<MATCHSEG3>>    part of field name that matches third wildcard",
  "related": [
    "eval"
  ],
  "tags": [
    "subsearch",
    "eval",
    "computation",
    "wildcard",
    "fields"
  ]
};

/**
 * gauge command
 *
 * Category: reporting
 * Description: Transforms results into a format suitable for display by the Gauge chart types.  Each argument must be a real number or the name of a numeric field.  Numeric field values will be taken from the first input result, the remainder are ignored.  The first argument is the gauge value and is required.  Each argument after that is optional and defines a range for different sections of the gauge.  If there are no range values provided, the gauge will start at 0 and end at 100.  If two or more range values are provided, The gauge will begin at the first range value, and end with the final range value.  Intermediate range values will be used to split the total range into subranges which will be visually distinct.  A single range value is meaningless and will be treated identically as no range values.
 */
export const gaugeCommand: CommandSyntax = {
  "command": "gauge",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "gauge"
      },
      {
        "kind": "alternation",
        "options": [
          {
            "kind": "param",
            "type": "num"
          },
          {
            "kind": "param",
            "type": "field",
            "effect": "consumes"
          }
        ]
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "group",
          "pattern": {
            "kind": "alternation",
            "options": [
              {
                "kind": "param",
                "type": "num"
              },
              {
                "kind": "param",
                "type": "field",
                "effect": "consumes"
              }
            ]
          },
          "quantifier": "+"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "reporting",
  "description": "Transforms results into a format suitable for display by the Gauge chart types.  Each argument must be a real number or the name of a numeric field.  Numeric field values will be taken from the first input result, the remainder are ignored.  The first argument is the gauge value and is required.  Each argument after that is optional and defines a range for different sections of the gauge.  If there are no range values provided, the gauge will start at 0 and end at 100.  If two or more range values are provided, The gauge will begin at the first range value, and end with the final range value.  Intermediate range values will be used to split the total range into subranges which will be visually distinct.  A single range value is meaningless and will be treated identically as no range values.",
  "related": [
    "eval stats"
  ],
  "tags": [
    "stats",
    "format",
    "display",
    "chart",
    "dial"
  ]
};

/**
 * gentimes command
 *
 * Category: results::generate
 * Description: Generates time range results. This command is useful in conjunction with the 'map' command.
 */
export const gentimesCommand: CommandSyntax = {
  "command": "gentimes",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "gentimes"
      },
      {
        "kind": "param",
        "type": "field",
        "name": "start"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "end"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "increment"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "results::generate",
  "description": "Generates time range results. This command is useful in conjunction with the 'map' command.",
  "related": [
    "map"
  ],
  "tags": [
    "time",
    "timestamp",
    "subsearch",
    "range",
    "timerange"
  ]
};

/**
 * geom command
 *
 * Category: reporting
 * Description: Geom command can generate polygon geometry in JSON style, for UI visualization. This command depends on lookup having been installed with external_type=geo.
 */
export const geomCommand: CommandSyntax = {
  "command": "geom",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "geom"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "effect": "consumes"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "effect": "consumes"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "effect": "consumes"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "num",
          "name": "gen"
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?",
        "effect": "consumes"
      }
    ]
  },
  "category": "reporting",
  "description": "Geom command can generate polygon geometry in JSON style, for UI visualization. This command depends on lookup having been installed with external_type=geo.",
  "related": [
    "geomfilter",
    "lookup"
  ],
  "tags": [
    "choropleth",
    "map"
  ]
};

/**
 * geomfilter command
 *
 * Category: reporting
 * Description: Geomfilter command accepts 2 points that specify a bounding box for clipping choropleth map; points fell out of the bounding box will be filtered out.
 */
export const geomfilterCommand: CommandSyntax = {
  "command": "geomfilter",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "geomfilter"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?",
        "effect": "consumes"
      }
    ]
  },
  "category": "reporting",
  "description": "Geomfilter command accepts 2 points that specify a bounding box for clipping choropleth map; points fell out of the bounding box will be filtered out.",
  "related": [
    "geom"
  ],
  "tags": [
    "choropleth",
    "map"
  ]
};

/**
 * geostats command
 *
 * Category: reporting
 * Description: Use the geostats command to compute statistical functions suitable for rendering on  a world map. First, the events will be clustered based on latitude and longitude fields in the events.  Then, the statistics will be evaluated on the generated clusters, optionally grouped or split by fields using a by-clause.\p\ For map rendering and zooming efficiency, geostats generates clustered stats at a variety of zoom levels in one search, the visualization selecting among them. The quantity of zoom levels can be controlled by the options binspanlat/binspanlong/maxzoomlevel. The initial granularity is selected by binspanlat together with binspanlong.  At each level of zoom, the number of bins will be doubled in both dimensions (a total of 4x as many bins for each zoom-in).
 */
export const geostatsCommand: CommandSyntax = {
  "command": "geostats",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "geostats"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "translatetoxy"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "latfield"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "longfield"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "outputlatfield"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "outputlongfield"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "globallimit"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "locallimit"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "param",
              "type": "field",
              "name": "binspanlat",
              "effect": "consumes"
            },
            {
              "kind": "param",
              "type": "field",
              "name": "binspanlong",
              "effect": "consumes"
            }
          ]
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "maxzoomlevel"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "effect": "consumes"
        },
        "quantifier": "*"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "effect": "consumes"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "reporting",
  "description": "Use the geostats command to compute statistical functions suitable for rendering on  a world map. First, the events will be clustered based on latitude and longitude fields in the events.  Then, the statistics will be evaluated on the generated clusters, optionally grouped or split by fields using a by-clause.\\p\\ For map rendering and zooming efficiency, geostats generates clustered stats at a variety of zoom levels in one search, the visualization selecting among them. The quantity of zoom levels can be controlled by the options binspanlat/binspanlong/maxzoomlevel. The initial granularity is selected by binspanlat together with binspanlong.  At each level of zoom, the number of bins will be doubled in both dimensions (a total of 4x as many bins for each zoom-in).",
  "related": [
    "stats",
    "xyseries",
    "chart"
  ],
  "tags": [
    "stats",
    "statistics"
  ]
};

/**
 * head command
 *
 * Category: results::order
 * Description: Returns the first n results, or 10 if no integer is specified. New for 4.0, can provide a boolean eval expression, in which case we return events until that expression evaluates to false.
 */
export const headCommand: CommandSyntax = {
  "command": "head",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "head"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "alternation",
          "options": [
            {
              "kind": "param",
              "type": "int"
            },
            {
              "kind": "sequence",
              "patterns": [
                {
                  "kind": "literal",
                  "value": "("
                },
                {
                  "kind": "param",
                  "type": "evaled-field"
                },
                {
                  "kind": "literal",
                  "value": ")"
                }
              ]
            }
          ]
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "limit"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "null"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "keeplast"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "results::order",
  "description": "Returns the first n results, or 10 if no integer is specified. New for 4.0, can provide a boolean eval expression, in which case we return events until that expression evaluates to false.",
  "related": [
    "reverse",
    "tail"
  ],
  "tags": [
    "head",
    "first",
    "top",
    "leading",
    "latest"
  ]
};

/**
 * highlight command
 *
 * Category: formatting
 * Description: Causes each of the space separated or comma-separated strings provided to be highlighted by the splunk web UI.  These strings are matched case insensitively.
 */
export const highlightCommand: CommandSyntax = {
  "command": "highlight",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "highlight"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string"
        },
        "quantifier": "+"
      }
    ]
  },
  "category": "formatting",
  "description": "Causes each of the space separated or comma-separated strings provided to be highlighted by the splunk web UI.  These strings are matched case insensitively.",
  "related": [
    "iconify",
    "abstract"
  ],
  "tags": [
    "ui",
    "search"
  ]
};

/**
 * history command
 *
 * Category: results::read
 * Description: Returns information about searches that the current user has run.   By default, the search strings are presented as a field called "search". If events=true, then the search strings are presented as the text of the events, as the _raw field.
 */
export const historyCommand: CommandSyntax = {
  "command": "history",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "history"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "events"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "results::read",
  "description": "Returns information about searches that the current user has run.   By default, the search strings are presented as a field called \"search\". If events=true, then the search strings are presented as the text of the events, as the _raw field.",
  "related": [
    "search"
  ],
  "tags": [
    "history",
    "search"
  ]
};

/**
 * iconify command
 *
 * Category: formatting
 * Description: Causes the UI to make a unique icon for each value of the fields listed.
 */
export const iconifyCommand: CommandSyntax = {
  "command": "iconify",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "iconify"
      },
      {
        "kind": "param",
        "type": "field-list"
      }
    ]
  },
  "category": "formatting",
  "description": "Causes the UI to make a unique icon for each value of the fields listed.",
  "related": [
    "highlight",
    "abstract"
  ],
  "tags": [
    "ui",
    "search",
    "icon",
    "image"
  ]
};

/**
 * inputcsv command
 *
 * Category: results::read
 * Description: Populates the results data structure using the given csv file, which is not modified. The filename must refer to a relative path in $SPLUNK_HOME/var/run/splunk/csv (if dispatch option is set to true, filename refers to a file in the job directory in $SPLUNK_HOME/var/run/splunk/dispatch/<job id>/). If the specified file does not exist and the filename did not have an extension, then filename with a ".csv" extension is assumed. \i\ The optional argument 'start' controls the 0-based offset of the first event to be read (default=0). The optional argument 'max' controls the maximum number of events to be read from the file (default = 1000000000). 'events' is an option that allows the imported results to be treated as events, i.e., so that a proper timeline and fields picker are displayed. If 'append' is set to true (false by default), the data from the csv file is appended to the current set of results rather than replacing it.
 */
export const inputcsvCommand: CommandSyntax = {
  "command": "inputcsv",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "inputcsv"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "dispatch"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "append"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "start"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "max"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "events"
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "literal",
              "value": "WHERE"
            },
            {
              "kind": "param",
              "type": "field"
            }
          ]
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "results::read",
  "description": "Populates the results data structure using the given csv file, which is not modified. The filename must refer to a relative path in $SPLUNK_HOME/var/run/splunk/csv (if dispatch option is set to true, filename refers to a file in the job directory in $SPLUNK_HOME/var/run/splunk/dispatch/<job id>/). If the specified file does not exist and the filename did not have an extension, then filename with a \".csv\" extension is assumed. \\i\\ The optional argument 'start' controls the 0-based offset of the first event to be read (default=0). The optional argument 'max' controls the maximum number of events to be read from the file (default = 1000000000). 'events' is an option that allows the imported results to be treated as events, i.e., so that a proper timeline and fields picker are displayed. If 'append' is set to true (false by default), the data from the csv file is appended to the current set of results rather than replacing it.",
  "related": [
    "outputcsv"
  ],
  "tags": [
    "input",
    "csv",
    "load",
    "read"
  ]
};

/**
 * inputlookup command
 *
 * Category: results::read
 * Description: Reads in lookup table as specified by a filename (must end with .csv or .csv.gz) or a table name (as specified by a stanza name in transforms.conf). If 'append' is set to true (false by default), the data from the lookup file is appended to the current set of results rather than replacing it.
 */
export const inputlookupCommand: CommandSyntax = {
  "command": "inputlookup",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "inputlookup"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "append"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "start"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "max"
        },
        "quantifier": "?"
      },
      {
        "kind": "alternation",
        "options": [
          {
            "kind": "param",
            "type": "field"
          },
          {
            "kind": "param",
            "type": "field"
          }
        ]
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "literal",
              "value": "where"
            },
            {
              "kind": "param",
              "type": "field"
            }
          ]
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "results::read",
  "description": "Reads in lookup table as specified by a filename (must end with .csv or .csv.gz) or a table name (as specified by a stanza name in transforms.conf). If 'append' is set to true (false by default), the data from the lookup file is appended to the current set of results rather than replacing it.",
  "related": [
    "inputcsv",
    "join",
    "lookup",
    "outputlookup"
  ],
  "tags": [
    "lookup",
    "input",
    "table"
  ]
};

/**
 * internalinputcsv command
 *
 * Category: unknown
 * Description: Reads in events from <filename> but does not do as much error checking and will not collapse into  multiple files if the filename is too large. Internal debugging operator.
 */
export const internalinputcsvCommand: CommandSyntax = {
  "command": "internalinputcsv",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "internalinputcsv"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  },
  "category": "unknown",
  "description": "Reads in events from <filename> but does not do as much error checking and will not collapse into  multiple files if the filename is too large. Internal debugging operator.",
  "related": [],
  "tags": []
};

/**
 * iplocation command
 *
 * Category: fields::add
 * Description: The ip-address field in ip-address-fieldname is looked up in a database and location fields  information is added to the event. The fields are City, Continent, Country, MetroCode, Region, Timezone, lat(latitude) and lon(longitude). Not all of the information is available for all ip address ranges, and hence it is normal to have some of the fields empty. The Continent, MetroCode, and Timezone are only added if allfields=true (default is false). prefix=string will add a certain prefix to all fieldnames if you desire to uniquely qualify added field names and avoid name collisions with existing fields (default is NULL/empty string). The lang setting can be used to render strings in alternate languages (for example "lang=es" for spanish)  The set of languages depends on the geoip database in use.  The special language "lang=code" will return fields as abbreviations where possible.
 */
export const iplocationCommand: CommandSyntax = {
  "command": "iplocation",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "iplocation"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "prefix"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "allfields"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "lang"
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "creates"
      }
    ]
  },
  "category": "fields::add",
  "description": "The ip-address field in ip-address-fieldname is looked up in a database and location fields  information is added to the event. The fields are City, Continent, Country, MetroCode, Region, Timezone, lat(latitude) and lon(longitude). Not all of the information is available for all ip address ranges, and hence it is normal to have some of the fields empty. The Continent, MetroCode, and Timezone are only added if allfields=true (default is false). prefix=string will add a certain prefix to all fieldnames if you desire to uniquely qualify added field names and avoid name collisions with existing fields (default is NULL/empty string). The lang setting can be used to render strings in alternate languages (for example \"lang=es\" for spanish)  The set of languages depends on the geoip database in use.  The special language \"lang=code\" will return fields as abbreviations where possible.",
  "related": [],
  "tags": [
    "ip",
    "location",
    "city",
    "geocode"
  ]
};

/**
 * join command
 *
 * Category: results::append
 * Description: You can perform an inner or left join. Use either 'outer' or  'left' to specify a left outer join. One or more of the fields must be common to each result set. If no fields are specified, all of the fields that are common to both result sets are used. Limitations on the join subsearch are specified in the limits.conf.spec file. Note: Another command, such as append or lookup, in combination with either stats or transaction might be a better alternative to the join command for flexibility and performance. \p\ The arguments 'left' and 'right' allow for specifying aliases in order to preserve the lineage of the fields in both result sets. The 'where' argument specifies the aliased fields to join on, where the fields are no longer required to be common to both result sets. \p\
 */
export const joinCommand: CommandSyntax = {
  "command": "join",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "join"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "*"
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  },
  "category": "results::append",
  "description": "You can perform an inner or left join. Use either 'outer' or  'left' to specify a left outer join. One or more of the fields must be common to each result set. If no fields are specified, all of the fields that are common to both result sets are used. Limitations on the join subsearch are specified in the limits.conf.spec file. Note: Another command, such as append or lookup, in combination with either stats or transaction might be a better alternative to the join command for flexibility and performance. \\p\\ The arguments 'left' and 'right' allow for specifying aliases in order to preserve the lineage of the fields in both result sets. The 'where' argument specifies the aliased fields to join on, where the fields are no longer required to be common to both result sets. \\p\\",
  "related": [
    "append",
    "lookup",
    "appendcols",
    "lookup",
    "selfjoin",
    "transaction"
  ],
  "tags": [
    "join",
    "combine",
    "unite",
    "append",
    "csv",
    "lookup",
    "inner",
    "outer",
    "left"
  ]
};

/**
 * kmeans command
 *
 * Category: results::group
 * Description: Performs k-means clustering on select fields (or all numerical fields if empty).  Events in the same cluster are  moved next to each other.  You have the option to display the cluster number for each event. The centroid of each cluster is also be displayed (with an option to disable it).
 */
export const kmeansCommand: CommandSyntax = {
  "command": "kmeans",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "kmeans"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "*"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field-list"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "results::group",
  "description": "Performs k-means clustering on select fields (or all numerical fields if empty).  Events in the same cluster are  moved next to each other.  You have the option to display the cluster number for each event. The centroid of each cluster is also be displayed (with an option to disable it).",
  "related": [
    "anomalies",
    "anomalousvalue",
    "cluster",
    "outlier"
  ],
  "tags": [
    "cluster",
    "group",
    "collect",
    "gather"
  ]
};

/**
 * kvform command
 *
 * Category: fields::add
 * Description: Extracts key-value pairs from events based on a form template.
 */
export const kvformCommand: CommandSyntax = {
  "command": "kvform",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "kvform"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "form"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "field",
          "effect": "creates"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "fields::add",
  "description": "Extracts key/value pairs from events based on a form template that describes how to extract the values.  If FORM is specified, it uses an installed <FORM>.form file found in the splunk configuration form directory. For example, if \"form=sales_order\", would look for a \"sales_order.form\" file in the 'forms' subdirectory in all apps, e.g. $SPLUNK_HOME$/etc/apps/*/forms/. All the events processed would be matched against that form, trying to extract values.\\p\\ If no FORM is specified, then the FIELD value determines the name of the field to extract.  For example, if \"field=error_code\", then an event that has an error_code=404, would be matched against a \"404.form\" file.\\p\\ The default value for FIELD is \"sourcetype\", thus by default kvform will look for <SOURCETYPE>.form files to extract values.\\p\\ A .form file is essentially a text file or all static parts of a form, interspersed with named references to regular expressions, of the type found in transforms.conf.  A .form might might look like this:\\i\\ Students Name: [[string:student_name]] \\i\\ Age: [[int:age]] Zip: [[int:zip]] .",
  "related": [
    "extract",
    "multikv",
    "rex",
    "xmlkv"
  ],
  "tags": [
    "form",
    "extract",
    "template"
  ]
};

/**
 * loadjob command
 *
 * Category: results::generate
 * Description: The artifacts to load are identified either by the search job id or a scheduled search name and the time range of the current search. If a savedsearch name is provided and multiple artifacts are found within that range the latest artifacts are loaded.
 */
export const loadjobCommand: CommandSyntax = {
  "command": "loadjob",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "loadjob"
      },
      {
        "kind": "alternation",
        "options": [
          {
            "kind": "param",
            "type": "field"
          },
          {
            "kind": "param",
            "type": "field"
          }
        ]
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      }
    ]
  },
  "category": "results::generate",
  "description": "The artifacts to load are identified either by the search job id or a scheduled search name and the time range of the current search. If a savedsearch name is provided and multiple artifacts are found within that range the latest artifacts are loaded.",
  "related": [
    "inputcsv",
    "file"
  ],
  "tags": [
    "artifacts"
  ]
};

/**
 * localize command
 *
 * Category: search::subsearch
 * Description: Generates a list of time contiguous event regions  defined as: a period of time in which consecutive events are separated by at most 'maxpause' time. The found regions can be expanded using the 'timeafter' and 'timebefore' modifiers to expand the range after/before the last/first event in the region respectively. The Regions are return in time descending order, just as search results (time of region is start time). The regions discovered by localize are meant to be feed into the MAP command, which will use a different region for each iteration. Localize also reports: (a) number of events in the range, (b) range duration in seconds and (c) region density defined as (#of events in range) divided by (range duration) - events per second.
 */
export const localizeCommand: CommandSyntax = {
  "command": "localize",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "localize"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      }
    ]
  },
  "category": "search::subsearch",
  "description": "Generates a list of time contiguous event regions  defined as: a period of time in which consecutive events are separated by at most 'maxpause' time. The found regions can be expanded using the 'timeafter' and 'timebefore' modifiers to expand the range after/before the last/first event in the region respectively. The Regions are return in time descending order, just as search results (time of region is start time). The regions discovered by localize are meant to be feed into the MAP command, which will use a different region for each iteration. Localize also reports: (a) number of events in the range, (b) range duration in seconds and (c) region density defined as (#of events in range) divided by (range duration) - events per second.",
  "related": [
    "map",
    "transaction"
  ],
  "tags": [
    "time",
    "timestamp",
    "subsearch",
    "range",
    "timerange"
  ]
};

/**
 * localop command
 *
 * Category: search::search
 * Description: Prevents subsequent commands from being executed on remote peers, i.e. forces subsequent commands to be part of the reduce step.
 */
export const localopCommand: CommandSyntax = {
  "command": "localop",
  "syntax": {
    "kind": "literal",
    "value": "localop"
  },
  "category": "search::search",
  "description": "Prevents subsequent commands from being executed on remote peers, i.e. forces subsequent commands to be part of the reduce step.",
  "related": [],
  "tags": [
    "debug",
    "distributed"
  ]
};

/**
 * lookup command
 *
 * Category: fields::read
 * Description: Manually invokes field value lookups from an existing lookup table or external  script. Lookup tables must be located in the lookups directory of $SPLUNK_HOME/etc/system/lookups or $SPLUNK_HOME/etc/apps/<app-name>/lookups. External scripts must be located in $SPLUNK_HOME/etc/searchscripts or $SPLUNK_HOME/etc/apps/<app_name>/bin.\p\ Specify a lookup field to match to a field in the events and, optionally, destination fields to add to the events. If you do not specify destination fields, adds all fields in the lookup table to events that have the match field. You can also overwrite fields in the events with fields in the lookup table, if they have the same field name.
 */
export const lookupCommand: CommandSyntax = {
  "command": "lookup",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "lookup"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "local"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "update"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "event_time_field"
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "param",
              "type": "field"
            },
            {
              "kind": "group",
              "pattern": {
                "kind": "sequence",
                "patterns": [
                  {
                    "kind": "literal",
                    "value": "as"
                  },
                  {
                    "kind": "param",
                    "type": "field"
                  }
                ]
              },
              "quantifier": "?"
            }
          ]
        },
        "quantifier": "+"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "alternation",
          "options": [
            {
              "kind": "literal",
              "value": "OUTPUT"
            },
            {
              "kind": "sequence",
              "patterns": [
                {
                  "kind": "literal",
                  "value": "OUTPUTNEW"
                },
                {
                  "kind": "group",
                  "pattern": {
                    "kind": "sequence",
                    "patterns": [
                      {
                        "kind": "param",
                        "type": "field"
                      },
                      {
                        "kind": "group",
                        "pattern": {
                          "kind": "sequence",
                          "patterns": [
                            {
                              "kind": "literal",
                              "value": "as"
                            },
                            {
                              "kind": "param",
                              "type": "field"
                            }
                          ]
                        },
                        "quantifier": "?"
                      }
                    ]
                  },
                  "quantifier": "+"
                }
              ]
            }
          ]
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "fields::read",
  "description": "Manually invokes field value lookups from an existing lookup table or external  script. Lookup tables must be located in the lookups directory of $SPLUNK_HOME/etc/system/lookups or $SPLUNK_HOME/etc/apps/<app-name>/lookups. External scripts must be located in $SPLUNK_HOME/etc/searchscripts or $SPLUNK_HOME/etc/apps/<app_name>/bin.\\p\\ Specify a lookup field to match to a field in the events and, optionally, destination fields to add to the events. If you do not specify destination fields, adds all fields in the lookup table to events that have the match field. You can also overwrite fields in the events with fields in the lookup table, if they have the same field name.",
  "related": [
    "appendcols inputlookup outputlookup"
  ],
  "tags": [
    "join",
    "combine",
    "append",
    "lookup",
    "table"
  ]
};

/**
 * makecontinuous command
 *
 * Category: reporting
 * Description: Makes a field that is supposed to be the x-axis continuous (invoked by chart/timechart).
 */
export const makecontinuousCommand: CommandSyntax = {
  "command": "makecontinuous",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "makecontinuous"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "effect": "consumes"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "effect": "consumes"
        },
        "quantifier": "*"
      }
    ]
  },
  "category": "reporting",
  "description": "Makes a field that is supposed to be the x-axis continuous (invoked by chart/timechart).",
  "related": [
    "chart timechart"
  ],
  "tags": [
    "continuous"
  ]
};

/**
 * makejson command
 *
 * Category: results::filter
 * Description: Combines the specified set of field names, or field name patterns,  and creates an field with the output name.
 */
export const makejsonCommand: CommandSyntax = {
  "command": "makejson",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "makejson"
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "param",
        "type": "string",
        "name": "output"
      }
    ]
  },
  "category": "results::filter",
  "description": "Combines the specified set of field names, or field name patterns, and creates a field with the output name.",
  "related": [],
  "tags": [
    "json"
  ]
};

/**
 * makemv command
 *
 * Category: fields::convert
 * Description: Treat specified field as multi-valued, using either a simple string delimiter (can be multicharacter), or a regex tokenizer.  If neither is provided, a default delimiter of " " (single space) is assumed.   The allowempty=<bool> option controls if consecutive delimiters should be treated as one (default = false). The setsv boolean option controls if the original value of the field should be kept for the single valued version.  It is kept if setsv = false, and it is false by default.
 */
export const makemvCommand: CommandSyntax = {
  "command": "makemv",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "makemv"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "alternation",
          "options": [
            {
              "kind": "param",
              "type": "string",
              "name": "delim"
            },
            {
              "kind": "param",
              "type": "string",
              "name": "tokenizer"
            }
          ]
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "allowempty"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "setsv"
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  },
  "category": "fields::convert",
  "description": "Treat specified field as multi-valued, using either a simple string delimiter (can be multicharacter), or a regex tokenizer.  If neither is provided, a default delimiter of \" \" (single space) is assumed.   The allowempty=<bool> option controls if consecutive delimiters should be treated as one (default = false). The setsv boolean option controls if the original value of the field should be kept for the single valued version.  It is kept if setsv = false, and it is false by default.",
  "related": [
    "mvcombine",
    "mvexpand",
    "nomv"
  ],
  "tags": [
    "multivalue",
    "convert"
  ]
};

/**
 * makeresults command
 *
 * Category: results::generate
 * Description: Creates a specified number of empty search results. This command will run only on the local machine  by default and will generate one unannotated empty result. It maybe used in conjunction with the eval command to generate an empty result for the eval command to operate on.
 */
export const makeresultsCommand: CommandSyntax = {
  "command": "makeresults",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "makeresults"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "*"
      }
    ]
  },
  "category": "results::generate",
  "description": "Creates a specified number of empty search results. This command will run only on the local machine  by default and will generate one unannotated empty result. It maybe used in conjunction with the eval command to generate an empty result for the eval command to operate on.",
  "related": [],
  "tags": []
};

/**
 * map command
 *
 * Category: results::generate
 * Description: For each input search result, takes the field-values from that result and substitutes their value for the $variable$ in the search argument.  The value of variables surrounded in quotes (e.g. text="$_raw$") will be quote escaped. The search argument can either be a subsearch to run or just the name of a savedsearch. The following metavariables are also supported: 1. $_serial_id$ - 1-based serial number within map of the search being executed.
 */
export const mapCommand: CommandSyntax = {
  "command": "map",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "map"
      },
      {
        "kind": "alternation",
        "options": [
          {
            "kind": "param",
            "type": "field"
          },
          {
            "kind": "param",
            "type": "field"
          }
        ]
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      }
    ]
  },
  "category": "results::generate",
  "description": "For each input search result, takes the field-values from that result and substitutes their value for the $variable$ in the search argument.  The value of variables surrounded in quotes (e.g. text=\"$_raw$\") will be quote escaped. The search argument can either be a subsearch to run or just the name of a savedsearch. The following metavariables are also supported: 1. $_serial_id$ - 1-based serial number within map of the search being executed.",
  "related": [
    "gentimes",
    "search"
  ],
  "tags": [
    "map",
    "subsearch",
    "loop",
    "savedsearch"
  ]
};

/**
 * mcatalog command
 *
 * Category: reporting
 * Description: Returns the list of values for the metric_name or dimension fields from all metric indexes,  unless an index name is specified in the WHERE clause. The '_values' field is not allowed. Supports GROUPBY on the metric_name or dimension fields, however you cannot specify a time span with this command. \i\ Arguments:                                                                                                                                                \i\ "prestats": Returns the results in prestats format. You can pipe the results into another command that takes prestats output, such as chart or timechart. \i\ This is useful for creating graphs. Default is "prestats=false".                                                                              \i\ "append": Valid only when "prestats=true". This argument runs the mstats command and adds                                                                 \i\ the results to an existing set of results instead of generating new results. Default is "append=false".                                         \i\
 */
export const mcatalogCommand: CommandSyntax = {
  "command": "mcatalog",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "mcatalog"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "prestats"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "append"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "sequence",
              "patterns": [
                {
                  "kind": "literal",
                  "value": "values"
                },
                {
                  "kind": "literal",
                  "value": "("
                },
                {
                  "kind": "param",
                  "type": "field",
                  "effect": "consumes"
                },
                {
                  "kind": "literal",
                  "value": ")"
                }
              ]
            },
            {
              "kind": "group",
              "pattern": {
                "kind": "sequence",
                "patterns": [
                  {
                    "kind": "literal",
                    "value": "as"
                  },
                  {
                    "kind": "param",
                    "type": "field",
                    "effect": "consumes"
                  }
                ]
              },
              "quantifier": "?"
            }
          ]
        },
        "quantifier": "+"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "literal",
              "value": "WHERE"
            },
            {
              "kind": "param",
              "type": "evaled-field"
            }
          ]
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "alternation",
              "options": [
                {
                  "kind": "literal",
                  "value": "BY"
                },
                {
                  "kind": "literal",
                  "value": "GROUPBY"
                }
              ]
            },
            {
              "kind": "param",
              "type": "field-list",
              "effect": "consumes"
            }
          ]
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "reporting",
  "description": "Returns the list of values for the metric_name or dimension fields from all metric indexes,  unless an index name is specified in the WHERE clause. The '_values' field is not allowed. Supports GROUPBY on the metric_name or dimension fields, however you cannot specify a time span with this command. \\i\\ Arguments:                                                                                                                                                \\i\\ \"prestats\": Returns the results in prestats format. You can pipe the results into another command that takes prestats output, such as chart or timechart. \\i\\ This is useful for creating graphs. Default is \"prestats=false\".                                                                              \\i\\ \"append\": Valid only when \"prestats=true\". This argument runs the mstats command and adds                                                                 \\i\\ the results to an existing set of results instead of generating new results. Default is \"append=false\".                                         \\i\\",
  "related": [],
  "tags": []
};

/**
 * mcollect command
 *
 * Category: index::summary
 * Description: Converts search results into metric data and inserts the data into a metric index  on the search head. If each result contains only one metric_name field and one numeric _value field, the result is already a normalized metrics data point, the result does not need to be split and can be consumed directly. Otherwise, each result is spit into multiple metric data points based on the specified list of dimension fields. If the '_time' field is present in the results, it is used as the timestamp of the metric datapoint. If the '_time' field is not present, the current time is used. Arguments: “index”: The index where the collected metric data are placed. This argument is required. “file”: The file name where you want the collected metrics data to be written. The default file name is a random filename. You can use a timestamp or a random number for the file name by specifying either file=$timestamp$ or file=$random$. Defaults to $random$_metrics.csv “split”: If split=false (which is the default setting), the results must include a 'metric_name' field for the name of the metric, and a '_value' field for the numerical value of the metric. If split=true, <field-list> must be specified. “spool”: If spool=true (which is the default setting), the metrics data file is written to the Splunk spool directory, $SPLUNK_HOME/var/spool/splunk, where the file is indexed automatically. If spool=false, the file is written to the $SPLUNK_HOME/var/run/splunk directory. The file remains in this directory unless some form of further automation or administration is done. \
 */
export const mcollectCommand: CommandSyntax = {
  "command": "mcollect",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "mcollect"
      },
      {
        "kind": "param",
        "type": "string",
        "name": "index"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "file"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "split"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "spool"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "prefix_field"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "host"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "source"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "sourcetype"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field-list"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "index::summary",
  "description": "Converts search results into metric data and inserts the data into a metric index  on the search head. If each result contains only one metric_name field and one numeric _value field, the result is already a normalized metrics data point, the result does not need to be split and can be consumed directly. Otherwise, each result is spit into multiple metric data points based on the specified list of dimension fields. If the '_time' field is present in the results, it is used as the timestamp of the metric datapoint. If the '_time' field is not present, the current time is used. Arguments: “index”: The index where the collected metric data are placed. This argument is required. “file”: The file name where you want the collected metrics data to be written. The default file name is a random filename. You can use a timestamp or a random number for the file name by specifying either file=$timestamp$ or file=$random$. Defaults to $random$_metrics.csv “split”: If split=false (which is the default setting), the results must include a 'metric_name' field for the name of the metric, and a '_value' field for the numerical value of the metric. If split=true, <field-list> must be specified. “spool”: If spool=true (which is the default setting), the metrics data file is written to the Splunk spool directory, $SPLUNK_HOME/var/spool/splunk, where the file is indexed automatically. If spool=false, the file is written to the $SPLUNK_HOME/var/run/splunk directory. The file remains in this directory unless some form of further automation or administration is done. \\",
  "related": [
    "collect meventcollect"
  ],
  "tags": [
    "collect",
    "summary",
    "summaryindex",
    "metrics",
    "“prefix_field”:",
    "Is",
    "applicable",
    "only",
    "when",
    "split",
    "=",
    "true.",
    "If",
    "specified,",
    "any",
    "event",
    "with",
    "that",
    "field",
    "missing",
    "is",
    "ignored.",
    "Otherwise,",
    "the",
    "field",
    "value",
    "is",
    "prefixed",
    "to",
    "the",
    "metric",
    "name.",
    "\"host\":",
    "The",
    "name",
    "of",
    "the",
    "host",
    "that",
    "you",
    "want",
    "to",
    "specify",
    "for",
    "the",
    "collected",
    "metrics",
    "data.",
    "Only",
    "applicable",
    "when",
    "spool=true.",
    "\"source\":",
    "The",
    "name",
    "of",
    "the",
    "source",
    "that",
    "you",
    "want",
    "to",
    "specify",
    "for",
    "the",
    "collected",
    "metrics",
    "data.",
    "Defaults",
    "to",
    "the",
    "name",
    "of",
    "search.",
    "\"sourcetype\":",
    "The",
    "name",
    "of",
    "the",
    "source",
    "type",
    "that",
    "is",
    "specified",
    "for",
    "the",
    "collected",
    "metrics",
    "data.",
    "This",
    "setting",
    "defaults",
    "to",
    "mcollect_stash.",
    "License",
    "usage",
    "is",
    "not",
    "calculated",
    "for",
    "data",
    "indexed",
    "with",
    "the",
    "mcollect_stash",
    "source",
    "type.",
    "If",
    "you",
    "change",
    "to",
    "a",
    "different",
    "source",
    "type,",
    "the",
    "Splunk",
    "platform",
    "calculates",
    "license",
    "usage",
    "for",
    "any",
    "data",
    "indexed",
    "by",
    "the",
    "mcollect",
    "command.",
    "NOTE:",
    "Do",
    "not",
    "change",
    "this",
    "setting",
    "without",
    "assistance",
    "from",
    "Splunk",
    "Professional",
    "Services",
    "or",
    "Splunk",
    "Support.",
    "Changing",
    "the",
    "source",
    "type",
    "requires",
    "a",
    "change",
    "to",
    "the",
    "props.conf",
    "file.",
    "“field-list”:",
    "A",
    "list",
    "of",
    "dimension",
    "fields.",
    "Optional",
    "if",
    "split=false",
    "(the",
    "default),",
    "required",
    "if",
    "split=true.",
    "If",
    "“field-list”",
    "is",
    "not",
    "specified,",
    "all",
    "fields",
    "are",
    "treated",
    "as",
    "dimensions",
    "for",
    "the",
    "data",
    "point",
    "except",
    "for",
    "the",
    "“prefix_field”",
    "and",
    "internal",
    "fields",
    "(fields",
    "with",
    "an",
    "underscore",
    "’_’",
    "prefix).",
    "If",
    "“field-list”",
    "is",
    "specified,",
    "the",
    "list",
    "must",
    "be",
    "specified",
    "at",
    "the",
    "end",
    "of",
    "the",
    "mcollect",
    "command",
    "arguments.",
    "If",
    "“field-list”",
    "is",
    "specified,",
    "all",
    "fields",
    "are",
    "treated",
    "as",
    "metric",
    "values,",
    "except",
    "for",
    "fields",
    "in",
    "“field-list”,",
    "the",
    "“prefix-field”,",
    "and",
    "internal",
    "fields.",
    "The",
    "name",
    "of",
    "each",
    "metric",
    "value",
    "is",
    "the",
    "field",
    "name",
    "prefixed",
    "with",
    "the",
    "”prefix_field”",
    "value.",
    "Effectively,",
    "one",
    "metric",
    "data",
    "point",
    "is",
    "returned",
    "for",
    "each",
    "qualifying",
    "field",
    "that",
    "contains",
    "a",
    "numerical",
    "value.",
    "If",
    "one",
    "search",
    "result",
    "contains",
    "multiple",
    "qualifying",
    "metric",
    "name/value",
    "pairs,",
    "the",
    "result",
    "is",
    "split",
    "into",
    "multiple",
    "metric",
    "data",
    "points."
  ]
};

/**
 * metadata command
 *
 * Category: administrative
 * Description: This search command generates a list of source, sourcetypes, or hosts from the index. Optional splunk_server argument specifies whether or not to limit results to one specific server. Optional datatype argument specifies whether to only search from event indexes or metrics index. If datatype is not specified, only search from event indexes.
 */
export const metadataCommand: CommandSyntax = {
  "command": "metadata",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "metadata"
      },
      {
        "kind": "param",
        "type": "field",
        "name": "type"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "*"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "splunk_server"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "splunk_server_group"
        },
        "quantifier": "*"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "datatype"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "administrative",
  "description": "This search command generates a list of source, sourcetypes, or hosts from the index. Optional splunk_server argument specifies whether or not to limit results to one specific server. Optional datatype argument specifies whether to only search from event indexes or metrics index. If datatype is not specified, only search from event indexes.",
  "related": [
    "dbinspect"
  ],
  "tags": [
    "metadata",
    "host",
    "source",
    "sourcetype",
    "metric"
  ]
};

/**
 * metasearch command
 *
 * Category: search::search
 * Description: Retrieves event metadata from indexes based on terms in the <logical-expression>.  Metadata fields include source, sourcetype, host, _time, index, and splunk_server.
 */
export const metasearchCommand: CommandSyntax = {
  "command": "metasearch",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "metasearch"
      },
      {
        "kind": "param",
        "type": "evaled-field",
        "quantifier": "?"
      }
    ]
  },
  "category": "search::search",
  "description": "Retrieves event metadata from indexes based on terms in the <logical-expression>.  Metadata fields include source, sourcetype, host, _time, index, and splunk_server.",
  "related": [
    "search metadata"
  ],
  "tags": [
    "search",
    "query",
    "find"
  ]
};

/**
 * meventcollect command
 *
 * Category: index::summary
 * Description: Converts search results into metric data and inserts the data into a metric index  on the indexers. If each result contains only one metric_name field and one numeric _value field, the result is already a normalized metrics data point, the result does not need to be split and can be consumed directly. Otherwise, each result is spit into multiple metric data points based on the specified list of dimension fields. Only purely streaming commands can precede the meventcollect command so that results can be directly ingested on the indexers. Arguments: “index”: The index where the collect metric data are placed. This argument is required. “split”: If split=false (which is the default setting), the results must include a 'metric_name' field for the name of the metric, and a '_value' field for the numerical value of the metric. If split=true, <field-list> must be specified. “spool”: If spool=true (which is the default setting), the metrics data file is written to the Splunk spool directory, $SPLUNK_HOME/var/spool/splunk, where the file is indexed automatically. If spool=false, the file is written to the $SPLUNK_HOME/var/run/splunk directory. The file remains in this directory unless some form of further automation or administration is done. \
 */
export const meventcollectCommand: CommandSyntax = {
  "command": "meventcollect",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "meventcollect"
      },
      {
        "kind": "param",
        "type": "string",
        "name": "index"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "split"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "spool"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "prefix_field"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "host"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "source"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "sourcetype"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field-list"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "index::summary",
  "description": "Converts search results into metric data and inserts the data into a metric index  on the indexers. If each result contains only one metric_name field and one numeric _value field, the result is already a normalized metrics data point, the result does not need to be split and can be consumed directly. Otherwise, each result is spit into multiple metric data points based on the specified list of dimension fields. Only purely streaming commands can precede the meventcollect command so that results can be directly ingested on the indexers. Arguments: “index”: The index where the collect metric data are placed. This argument is required. “split”: If split=false (which is the default setting), the results must include a 'metric_name' field for the name of the metric, and a '_value' field for the numerical value of the metric. If split=true, <field-list> must be specified. “spool”: If spool=true (which is the default setting), the metrics data file is written to the Splunk spool directory, $SPLUNK_HOME/var/spool/splunk, where the file is indexed automatically. If spool=false, the file is written to the $SPLUNK_HOME/var/run/splunk directory. The file remains in this directory unless some form of further automation or administration is done. \\",
  "related": [
    "collect mcollect"
  ],
  "tags": [
    "collect",
    "summary",
    "summaryindex",
    "metrics",
    "“prefix_field”:",
    "Is",
    "applicable",
    "only",
    "when",
    "split",
    "=",
    "true.",
    "If",
    "specified,",
    "any",
    "event",
    "with",
    "that",
    "field",
    "missing",
    "is",
    "ignored.",
    "Otherwise,",
    "the",
    "field",
    "value",
    "is",
    "prefixed",
    "to",
    "the",
    "metric",
    "name.",
    "\"host\":",
    "The",
    "name",
    "of",
    "the",
    "host",
    "that",
    "you",
    "want",
    "to",
    "specify",
    "for",
    "the",
    "collected",
    "metrics",
    "data.",
    "Only",
    "applicable",
    "when",
    "spool=true.",
    "\"source\":",
    "The",
    "name",
    "of",
    "the",
    "source",
    "that",
    "you",
    "want",
    "to",
    "specify",
    "for",
    "the",
    "collected",
    "metrics",
    "data.",
    "Defaults",
    "to",
    "the",
    "name",
    "of",
    "search.",
    "\"sourcetype\":",
    "The",
    "name",
    "of",
    "the",
    "source",
    "type",
    "that",
    "is",
    "specified",
    "for",
    "the",
    "collected",
    "metrics",
    "data.",
    "This",
    "setting",
    "defaults",
    "to",
    "mcollect_stash.",
    "License",
    "usage",
    "is",
    "not",
    "calculated",
    "for",
    "data",
    "indexed",
    "with",
    "the",
    "mcollect_stash",
    "source",
    "type.",
    "If",
    "you",
    "change",
    "to",
    "a",
    "different",
    "source",
    "type,",
    "the",
    "Splunk",
    "platform",
    "calculates",
    "license",
    "usage",
    "for",
    "any",
    "data",
    "indexed",
    "by",
    "the",
    "meventcollect",
    "command.",
    "NOTE:",
    "Do",
    "not",
    "change",
    "this",
    "setting",
    "without",
    "assistance",
    "from",
    "Splunk",
    "Professional",
    "Services",
    "or",
    "Splunk",
    "Support.",
    "Changing",
    "the",
    "source",
    "type",
    "requires",
    "a",
    "change",
    "to",
    "the",
    "props.conf",
    "file.",
    "“field-list”:",
    "A",
    "list",
    "of",
    "dimension",
    "fields.",
    "Optional",
    "if",
    "split=false",
    "(the",
    "default),",
    "required",
    "if",
    "split=true.",
    "If",
    "“field-list”",
    "is",
    "not",
    "specified,",
    "all",
    "fields",
    "are",
    "treated",
    "as",
    "dimensions",
    "for",
    "the",
    "data",
    "point",
    "except",
    "for",
    "the",
    "“prefix_field”",
    "and",
    "internal",
    "fields",
    "(fields",
    "with",
    "an",
    "underscore",
    "’_’",
    "prefix).",
    "If",
    "“field-list”",
    "is",
    "specified,",
    "the",
    "list",
    "must",
    "be",
    "specified",
    "at",
    "the",
    "end",
    "of",
    "the",
    "mcollect",
    "command",
    "arguments.",
    "If",
    "“field-list”",
    "is",
    "specified,",
    "all",
    "fields",
    "are",
    "treated",
    "as",
    "metric",
    "values,",
    "except",
    "for",
    "fields",
    "in",
    "“field-list”,",
    "the",
    "“prefix-field”,",
    "and",
    "internal",
    "fields.",
    "The",
    "name",
    "of",
    "each",
    "metric",
    "value",
    "is",
    "the",
    "field",
    "name",
    "prefixed",
    "with",
    "the",
    "”prefix_field”",
    "value.",
    "Effectively,",
    "one",
    "metric",
    "data",
    "point",
    "is",
    "returned",
    "for",
    "each",
    "qualifying",
    "field",
    "that",
    "contains",
    "a",
    "numerical",
    "value.",
    "If",
    "one",
    "search",
    "result",
    "contains",
    "multiple",
    "qualifying",
    "metric",
    "name/value",
    "pairs,",
    "the",
    "result",
    "is",
    "split",
    "into",
    "multiple",
    "metric",
    "data",
    "points."
  ]
};

/**
 * mstats command
 *
 * Category: reporting
 * Description: Performs statistics on the measurement, metric_name, and   dimension fields in metric indexes. The mstats command is optimized for searches over one or more metric_name values, rather than searches over all metric_name values. It supports both historical and real-time searches. For a real-time search with a time window, mstats runs a historical search first that backfills the data.\p\ The mstats command is a generating command, except when it is in 'append=t' mode. As such, it must be the first command in a search.\p\ If the <stats-func> based syntax is used, the filter specified after the WHERE clause cannot filter on metric_name. Any metric_name filtering is performed based on the metric_name fields specified by the <stats-func> argument.  If the <stats-func-value> syntax is used, the WHERE clause *must* filter on metric_name (wildcards are ok). It is recommended to use the <stats-func> syntax when possible. The <stats-func-value> syntax is needed for cases where a single metric may be represented by several different metric names (e.g. "cpu.util" and "cpu.utilization"). \p\ You cannot blend the <stats-func> syntax with the <stats-func-value> syntax in a single mstats command. \p\ Arguments: \p\ "<stats-func>": A list of stats functions to compute for given metric_names. These are written as <function1>(metric_name1) <function2>(metric_name2) ... \p\ "<stats-func-value>": A list of stats functions to compute on metric values (_value).  These are written as <function1>(_value) <function2>(_value) ... \p\ "<logical-expression>": An expression describing the filters that are applied to your search. Includes time and search modifiers, comparison expressions, and index expressions. This expression cannot filter on metric_name if the <stats-func> syntax is used, but must filter on metric_name if the <stats-func-value> syntax is used.\p\ "<field-list>": Specifies one or more fields to group the results by. Required when using the 'BY' or 'GROUPBY' clause. \p\ "prestats": Returns the results in prestats format. You can pipe the results into commands that consume the prestats formatted data, such as chart or timechart, and output aggregate calculations. This is useful for creating graphs. Default is prestats=false. \p\ "append": Valid only when "prestats=true". This argument adds the results of the mstats run to an existing set of results instead of generating new results. Default is "append=false". \p\ "backfill": Valid only with windowed real-time searches. When set to "true", the mstats command runs a historical search to backfill the on-disk indexed data before searching the in-memory real-time data. Default is "backfill=true".\p\ "update_period": Valid only with real-time searches. Specifies how frequently, in milliseconds, the real-time summary for the mstats command is updated. By default, update_period=0, which is 1 second. A larger number means less frequent reads of the summary and less impact on index processing.
 */
export const mstatsCommand: CommandSyntax = {
  "command": "mstats",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "mstats"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "prestats"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "append"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "backfill"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "update_period"
        },
        "quantifier": "?"
      },
      {
        "kind": "alternation",
        "options": [
          {
            "kind": "group",
            "pattern": {
              "kind": "param",
              "type": "stats-func"
            },
            "quantifier": "+"
          },
          {
            "kind": "group",
            "pattern": {
              "kind": "param",
              "type": "field",
              "effect": "consumes"
            },
            "quantifier": "+"
          }
        ]
      },
      {
        "kind": "literal",
        "value": "WHERE"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "evaled-field"
        },
        "quantifier": "*"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "alternation",
              "options": [
                {
                  "kind": "literal",
                  "value": "BY"
                },
                {
                  "kind": "literal",
                  "value": "GROUPBY"
                }
              ]
            },
            {
              "kind": "param",
              "type": "field-list",
              "effect": "consumes"
            },
            {
              "kind": "group",
              "pattern": {
                "kind": "param",
                "type": "field",
                "name": "span",
                "effect": "consumes"
              },
              "quantifier": "?"
            }
          ]
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "reporting",
  "description": "Performs statistics on the measurement, metric_name, and   dimension fields in metric indexes. The mstats command is optimized for searches over one or more metric_name values, rather than searches over all metric_name values. It supports both historical and real-time searches. For a real-time search with a time window, mstats runs a historical search first that backfills the data.\\p\\ The mstats command is a generating command, except when it is in 'append=t' mode. As such, it must be the first command in a search.\\p\\ If the <stats-func> based syntax is used, the filter specified after the WHERE clause cannot filter on metric_name. Any metric_name filtering is performed based on the metric_name fields specified by the <stats-func> argument.  If the <stats-func-value> syntax is used, the WHERE clause *must* filter on metric_name (wildcards are ok). It is recommended to use the <stats-func> syntax when possible. The <stats-func-value> syntax is needed for cases where a single metric may be represented by several different metric names (e.g. \"cpu.util\" and \"cpu.utilization\"). \\p\\ You cannot blend the <stats-func> syntax with the <stats-func-value> syntax in a single mstats command. \\p\\ Arguments: \\p\\ \"<stats-func>\": A list of stats functions to compute for given metric_names. These are written as <function1>(metric_name1) <function2>(metric_name2) ... \\p\\ \"<stats-func-value>\": A list of stats functions to compute on metric values (_value).  These are written as <function1>(_value) <function2>(_value) ... \\p\\ \"<logical-expression>\": An expression describing the filters that are applied to your search. Includes time and search modifiers, comparison expressions, and index expressions. This expression cannot filter on metric_name if the <stats-func> syntax is used, but must filter on metric_name if the <stats-func-value> syntax is used.\\p\\ \"<field-list>\": Specifies one or more fields to group the results by. Required when using the 'BY' or 'GROUPBY' clause. \\p\\ \"prestats\": Returns the results in prestats format. You can pipe the results into commands that consume the prestats formatted data, such as chart or timechart, and output aggregate calculations. This is useful for creating graphs. Default is prestats=false. \\p\\ \"append\": Valid only when \"prestats=true\". This argument adds the results of the mstats run to an existing set of results instead of generating new results. Default is \"append=false\". \\p\\ \"backfill\": Valid only with windowed real-time searches. When set to \"true\", the mstats command runs a historical search to backfill the on-disk indexed data before searching the in-memory real-time data. Default is \"backfill=true\".\\p\\ \"update_period\": Valid only with real-time searches. Specifies how frequently, in milliseconds, the real-time summary for the mstats command is updated. By default, update_period=0, which is 1 second. A larger number means less frequent reads of the summary and less impact on index processing.",
  "related": [
    "tstats"
  ],
  "tags": [
    "mstats",
    "metric",
    "tsidx",
    "projection"
  ]
};

/**
 * multikv command
 *
 * Category: fields::add
 * Description: Extracts fields from events with information in a tabular format (e.g. top, netstat, ps, ... etc).  A new event is created for each table row. Field names are derived from the title row of the table.
 */
export const multikvCommand: CommandSyntax = {
  "command": "multikv",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "multikv"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "conf",
          "effect": "creates"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "effect": "creates"
        },
        "quantifier": "*"
      }
    ]
  },
  "category": "fields::add",
  "description": "Extracts fields from events with information in a tabular format (e.g. top, netstat, ps, ... etc).  A new event is created for each table row. Field names are derived from the title row of the table.",
  "related": [
    "extract",
    "kvform",
    "rex",
    "xmlkv"
  ],
  "tags": [
    "extract",
    "table",
    "tabular",
    "column"
  ]
};

/**
 * mvcombine command
 *
 * Category: results::filter
 * Description: For each group of results that are identical except for the given field, combine them into a single result where the given field is a multivalue field.  DELIM controls how values are combined, defaulting to a space character (' ').
 */
export const mvcombineCommand: CommandSyntax = {
  "command": "mvcombine",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "mvcombine"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "delim"
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  },
  "category": "results::filter",
  "description": "For each group of results that are identical except for the given field, combine them into a single result where the given field is a multivalue field.  DELIM controls how values are combined, defaulting to a space character (' ').",
  "related": [
    "makemv",
    "mvexpand",
    "nomv"
  ],
  "tags": [
    "combine",
    "merge",
    "join",
    "unite",
    "multivalue"
  ]
};

/**
 * mvexpand command
 *
 * Category: results::generate
 * Description: For each result with the specified field, create a new result for each value of that field in that result if it a multivalue field.
 */
export const mvexpandCommand: CommandSyntax = {
  "command": "mvexpand",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "mvexpand"
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "limit"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "results::generate",
  "description": "For each result with the specified field, create a new result for each value of that field in that result if it a multivalue field.",
  "related": [
    "makemv",
    "mvcombine",
    "nomv"
  ],
  "tags": [
    "separate",
    "divide",
    "disconnect",
    "multivalue"
  ]
};

/**
 * newseriesfilter command
 *
 * Category: unknown
 * Description: Used by timechart.
 */
export const newseriesfilterCommand: CommandSyntax = {
  "command": "newseriesfilter",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "newseriesfilter"
      },
      {
        "kind": "param",
        "type": "string"
      }
    ]
  },
  "category": "unknown",
  "description": "Used by timechart.",
  "related": [],
  "tags": []
};

/**
 * nokv command
 *
 * Category: unknown
 * Description: Tells the search pipeline not to perform any automatic key/value extraction.
 */
export const nokvCommand: CommandSyntax = {
  "command": "nokv",
  "syntax": {
    "kind": "literal",
    "value": "nokv"
  },
  "category": "unknown",
  "description": "Tells the search pipeline not to perform any automatic key/value extraction.",
  "related": [],
  "tags": []
};

/**
 * nomv command
 *
 * Category: fields::convert
 * Description: Converts values of the specified multi-valued field into one single value (overrides multi-value field configurations set in fields.conf).
 */
export const nomvCommand: CommandSyntax = {
  "command": "nomv",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "nomv"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  },
  "category": "fields::convert",
  "description": "Converts values of the specified multi-valued field into one single value (overrides multi-value field configurations set in fields.conf).",
  "related": [
    "makemv",
    "mvcombine",
    "mvexpand",
    "convert"
  ],
  "tags": [
    "single",
    "multivalue"
  ]
};

/**
 * outlier command
 *
 * Category: reporting
 * Description: Removes or truncates outlying numerical values in selected fields. If no fields are specified, then outlier will attempt to process all fields.
 */
export const outlierCommand: CommandSyntax = {
  "command": "outlier",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "outlier"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "effect": "consumes"
        },
        "quantifier": "*"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field-list",
          "effect": "consumes"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "reporting",
  "description": "Removes or truncates outlying numerical values in selected fields. If no fields are specified, then outlier will attempt to process all fields.",
  "related": [
    "anomalies",
    "anomalousvalue",
    "cluster",
    "kmeans"
  ],
  "tags": [
    "outlier",
    "anomaly",
    "unusual",
    "odd",
    "irregular",
    "dangerous",
    "unexpected"
  ]
};

/**
 * outputcsv command
 *
 * Category: results::write
 * Description: If no filename specified, rewrites the contents of each result as a CSV row into the "_xml" field.  Otherwise writes into file (appends ".csv" to filename if filename has no existing extension). If singlefile is set to true and output spans multiple files, collapses it into a single file. The option usexml=[t|f] specifies whether or not to encode the csv output into xml and has effect only when no filename is specified.  This option should not specified when invoking outputcsv from the UI.  If dispatch option is set to true, filename refers to a file in the job directory in $SPLUNK_HOME/var/run/splunk/dispatch/<job id>/ If 'create_empty' is true and no results are passed to outputcsv, an 0-length file is created. When false (the default) no file is created and the file is deleted if it previously existed. If 'override_if_empty' is set to its default of true and no results are passed to outputcsv, the command deletes the output file if it exists.  If set to false, the command does not delete the existing output file. If 'append' is true, we will attempt to append to an existing csv file if it exists or create a file if necessary.  If there is an existing file that has a csv header already, we will only emit the fields that are referenced by that header.  (Defaults to false)  .gz files cannot be append to.
 */
export const outputcsvCommand: CommandSyntax = {
  "command": "outputcsv",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "outputcsv"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "append"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "create_empty"
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "bool",
        "name": "override_if_empty",
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "dispatch"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "usexml"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "singlefile"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "results::write",
  "description": "If no filename specified, rewrites the contents of each result as a CSV row into the \"_xml\" field.  Otherwise writes into file (appends \".csv\" to filename if filename has no existing extension). If singlefile is set to true and output spans multiple files, collapses it into a single file. The option usexml=[t|f] specifies whether or not to encode the csv output into xml and has effect only when no filename is specified.  This option should not specified when invoking outputcsv from the UI.  If dispatch option is set to true, filename refers to a file in the job directory in $SPLUNK_HOME/var/run/splunk/dispatch/<job id>/ If 'create_empty' is true and no results are passed to outputcsv, an 0-length file is created. When false (the default) no file is created and the file is deleted if it previously existed. If 'override_if_empty' is set to its default of true and no results are passed to outputcsv, the command deletes the output file if it exists.  If set to false, the command does not delete the existing output file. If 'append' is true, we will attempt to append to an existing csv file if it exists or create a file if necessary.  If there is an existing file that has a csv header already, we will only emit the fields that are referenced by that header.  (Defaults to false)  .gz files cannot be append to.",
  "related": [
    "inputcsv"
  ],
  "tags": [
    "output",
    "csv",
    "save",
    "write"
  ]
};

/**
 * outputraw command
 *
 * Category: formatting
 * Description: Outputs search results in a simple, raw text-based format, with each attribute value on a separate text line.  Useful for commandline searches.
 */
export const outputrawCommand: CommandSyntax = {
  "command": "outputraw",
  "syntax": {
    "kind": "literal",
    "value": "outputraw"
  },
  "category": "formatting",
  "description": "Outputs search results in a simple, raw text-based format, with each attribute value on a separate text line.  Useful for commandline searches.",
  "related": [
    "outputcsv",
    "outputtext"
  ],
  "tags": [
    "output"
  ]
};

/**
 * outputrawr command
 *
 * Category: formatting
 * Description: An easter egg command that replaces incoming search results with a single result with ascii art.
 */
export const outputrawrCommand: CommandSyntax = {
  "command": "outputrawr",
  "syntax": {
    "kind": "literal",
    "value": "outputrawr"
  },
  "category": "formatting",
  "description": "An easter egg command that replaces incoming search results with a single result with ascii art.",
  "related": [],
  "tags": [
    "output"
  ]
};

/**
 * outputtelemetry command
 *
 * Category: results::write
 * Description: Outputs search results to telemetry endpoint.
 */
export const outputtelemetryCommand: CommandSyntax = {
  "command": "outputtelemetry",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "outputtelemetry"
      },
      {
        "kind": "param",
        "type": "string",
        "name": "input"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "type"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "component"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "support"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "anonymous"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "license"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "optinrequired"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "results::write",
  "description": "Outputs search results to telemetry endpoint.  Required field “input” will have the endpoint payload. The other fields “component”, “type”, “optinrequired” are optional fields but the endpoint expects them to be supplied either with the search command or to be found in the event data. Visibility fields \"anonymous\", \"license\" and \"support\" are optional.",
  "related": [],
  "tags": [
    "output",
    "telemetry"
  ]
};

/**
 * outputtext command
 *
 * Category: formatting
 * Description: Rewrites the _raw field of the result into the "_xml" field.  If usexml is set to true (the default), the _raw field is XML escaped.
 */
export const outputtextCommand: CommandSyntax = {
  "command": "outputtext",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "outputtext"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "usexml"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "formatting",
  "description": "Rewrites the _raw field of the result into the \"_xml\" field.  If usexml is set to true (the default), the _raw field is XML escaped.",
  "related": [
    "outputcsv",
    "outputraw"
  ],
  "tags": [
    "output"
  ]
};

/**
 * overlap command
 *
 * Category: index::summary
 * Description: Find events in a summary index that overlap in time, or find gaps in time during which a scheduled saved search may have missed events.  Note: If you find a gap, run the search over the period of the gap and summary index the results (using | collect). If you find overlapping events, manually delete the overlaps from the summary index by using the search language.  Invokes an external python script (in etc/searchscripts/sumindexoverlap.py), which expects input events from the summary index and finds any time overlaps and gaps between events with the same 'info_search_name' but different 'info_search_id'.  Input events are expected to have the following fields: 'info_min_time', 'info_max_time' (inclusive and exclusive, respectively) , 'info_search_id' and 'info_search_name' fields.
 */
export const overlapCommand: CommandSyntax = {
  "command": "overlap",
  "syntax": {
    "kind": "literal",
    "value": "overlap"
  },
  "category": "index::summary",
  "description": "Find events in a summary index that overlap in time, or find gaps in time during which a scheduled saved search may have missed events.  Note: If you find a gap, run the search over the period of the gap and summary index the results (using | collect). If you find overlapping events, manually delete the overlaps from the summary index by using the search language.  Invokes an external python script (in etc/searchscripts/sumindexoverlap.py), which expects input events from the summary index and finds any time overlaps and gaps between events with the same 'info_search_name' but different 'info_search_id'.  Input events are expected to have the following fields: 'info_min_time', 'info_max_time' (inclusive and exclusive, respectively) , 'info_search_id' and 'info_search_name' fields.",
  "related": [
    "collect sistats sitop sirare sichart sitimechart"
  ],
  "tags": [
    "collect",
    "overlap",
    "index",
    "summary",
    "summaryindex"
  ]
};

/**
 * pivot command
 *
 * Category: reporting
 * Description: Must be the first command in a search. You must specify the model, object,  and the pivot element to run. The command will expand and run the specified pivot element.
 */
export const pivotCommand: CommandSyntax = {
  "command": "pivot",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "pivot"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      }
    ]
  },
  "category": "reporting",
  "description": "Must be the first command in a search. You must specify the model, object,  and the pivot element to run. The command will expand and run the specified pivot element.",
  "related": [
    "datamodel"
  ],
  "tags": [
    "datamodel",
    "model",
    "pivot"
  ]
};

/**
 * predict command
 *
 * Category: reporting
 * Description: The predict command must be preceded by the timechart command. The command can also fill in missing data in a time-series and provide predictions for the next several time steps. \p\ The predict command provides confidence intervals for all of its estimates. The command adds a predicted value and an upper and lower 95th (by default) percentile range to each event in the time-series.
 */
export const predictCommand: CommandSyntax = {
  "command": "predict",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "predict"
      },
      {
        "kind": "param",
        "type": "field-list",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?",
        "effect": "consumes"
      }
    ]
  },
  "category": "reporting",
  "description": "The predict command must be preceded by the timechart command. The command can also fill in missing data in a time-series and provide predictions for the next several time steps. \\p\\ The predict command provides confidence intervals for all of its estimates. The command adds a predicted value and an upper and lower 95th (by default) percentile range to each event in the time-series.",
  "related": [
    "trendline",
    "x11"
  ],
  "tags": [
    "forecast",
    "predict",
    "univariate",
    "bivariate",
    "kalman"
  ]
};

/**
 * preview command
 *
 * Category: results::generate
 * Description: Given a source file and a set of props.conf settings in  $SPLUNK_HOME/var/run/splunk/dispatch/<job_id>/indexpreview.csv, generate the events that the file would yield if it were indexed.
 */
export const previewCommand: CommandSyntax = {
  "command": "preview",
  "syntax": {
    "kind": "literal",
    "value": "preview"
  },
  "category": "results::generate",
  "description": "Given a source file and a set of props.conf settings in  $SPLUNK_HOME/var/run/splunk/dispatch/<job_id>/indexpreview.csv, generate the events that the file would yield if it were indexed.",
  "related": [],
  "tags": [
    "index",
    "preview"
  ]
};

/**
 * rare command
 *
 * Category: reporting
 * Description: Finds the least frequent tuple of values of all fields in the field list.  If optional by-clause is specified, this command will return rare tuples of values for each distinct tuple of values of the group-by fields.
 */
export const rareCommand: CommandSyntax = {
  "command": "rare",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "rare"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      }
    ]
  },
  "category": "reporting",
  "description": "Finds the least frequent tuple of values of all fields in the field list.  If optional by-clause is specified, this command will return rare tuples of values for each distinct tuple of values of the group-by fields.",
  "related": [
    "top",
    "stats",
    "sirare"
  ],
  "tags": [
    "rare",
    "few",
    "occasional",
    "scarce",
    "sparse",
    "uncommon",
    "unusual"
  ]
};

/**
 * rawstats command
 *
 * Category: unknown
 * Description: Returns statistics about the raw field that might be useful for filtering/classifying events.
 */
export const rawstatsCommand: CommandSyntax = {
  "command": "rawstats",
  "syntax": {
    "kind": "literal",
    "value": "rawstats"
  },
  "category": "unknown",
  "description": "Returns statistics about the raw field that might be useful for filtering/classifying events.",
  "related": [],
  "tags": []
};

/**
 * redistribute command
 *
 * Category: data::managing
 * Description: This command divides the search results  among a pool of intermediate reducers in the indexer layer. The reducers perform intermediary reduce operations in parallel on the search results before pushing them up to the search head, where a final reduction operation is performed. This parallelization of reduction work that would otherwise be done entirely by the search head can result in faster completion times for high-cardinality searches that aggregate large numbers of search results. \p\ Set num_of_reducers to control the number of intermediate reducers used from the pool. num_of_reducers defaults to a fraction of the indexer pool size, according to the 'winningRate' setting, and is limited by the 'maxReducersPerPhase' setting, both of which are specified on the search head in the [parallelreduce] stanza of limits.conf. \p\ The redistribute command divides events into partitions on the intermediate reducers according to the fields specified with the by-clause. If no by-clause fields are specified, the search processor uses the fields that work best with the commands that follow the redistribute command in the search. \p\ The redistribute command requires a distributed search environment with a pool of intermediate reducers at the indexer level. You must have a role with the run_multi_phased_searches capability to run this command. You can use the redistribute command only once in a search. \p\ The redistribute command supports streaming commands and the following nonstreaming commands: stats, tstats, streamstats, eventstats, sichart, and sitimechart. The redistribute command also supports transaction on a single field. \p\ The redistribute command moves the processing of a search string from the intermediate reducers to the search head when it encounters nonstreaming command that it does not support or that does not include a by-clause. The redistribute command also moves processing to the search head when it detects that a command has modified values of the fields specified in the redistribute by-clause. \p\ Note: When results are aggregated from the intermediate reducers at the search head, a sort order is imposed on the result rows only when an order-sensitive command such as 'sort' is in place to consume the reducer output.
 */
export const redistributeCommand: CommandSyntax = {
  "command": "redistribute",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "redistribute"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "num_of_reducers"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "data::managing",
  "description": "This command divides the search results  among a pool of intermediate reducers in the indexer layer. The reducers perform intermediary reduce operations in parallel on the search results before pushing them up to the search head, where a final reduction operation is performed. This parallelization of reduction work that would otherwise be done entirely by the search head can result in faster completion times for high-cardinality searches that aggregate large numbers of search results. \\p\\ Set num_of_reducers to control the number of intermediate reducers used from the pool. num_of_reducers defaults to a fraction of the indexer pool size, according to the 'winningRate' setting, and is limited by the 'maxReducersPerPhase' setting, both of which are specified on the search head in the [parallelreduce] stanza of limits.conf. \\p\\ The redistribute command divides events into partitions on the intermediate reducers according to the fields specified with the by-clause. If no by-clause fields are specified, the search processor uses the fields that work best with the commands that follow the redistribute command in the search. \\p\\ The redistribute command requires a distributed search environment with a pool of intermediate reducers at the indexer level. You must have a role with the run_multi_phased_searches capability to run this command. You can use the redistribute command only once in a search. \\p\\ The redistribute command supports streaming commands and the following nonstreaming commands: stats, tstats, streamstats, eventstats, sichart, and sitimechart. The redistribute command also supports transaction on a single field. \\p\\ The redistribute command moves the processing of a search string from the intermediate reducers to the search head when it encounters nonstreaming command that it does not support or that does not include a by-clause. The redistribute command also moves processing to the search head when it detects that a command has modified values of the fields specified in the redistribute by-clause. \\p\\ Note: When results are aggregated from the intermediate reducers at the search head, a sort order is imposed on the result rows only when an order-sensitive command such as 'sort' is in place to consume the reducer output.",
  "related": [],
  "tags": [
    "partition",
    "re-partition",
    "repartition",
    "shuffle",
    "collocate"
  ]
};

/**
 * regex command
 *
 * Category: results::filter
 * Description: Removes results that do not match the specified regular expression. You can specify for the regex to keep results that match the expression, or to keep those that do not match.  Note: if you want to use the "or" ("|") command in a regex argument, the whole regex expression must be surrounded by quotes (ie. regex "expression"). Matches the value of the field against the unanchored regex and only keeps those events that match in the case of '=' or do not match in the case of '!='. If no field is specified, the match is against "_raw".
 */
export const regexCommand: CommandSyntax = {
  "command": "regex",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "regex"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "param",
              "type": "field"
            },
            {
              "kind": "alternation",
              "options": [
                {
                  "kind": "literal",
                  "value": "="
                },
                {
                  "kind": "literal",
                  "value": "!="
                }
              ]
            }
          ]
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  },
  "category": "results::filter",
  "description": "Removes results that do not match the specified regular expression. You can specify for the regex to keep results that match the expression, or to keep those that do not match.  Note: if you want to use the \"or\" (\"|\") command in a regex argument, the whole regex expression must be surrounded by quotes (ie. regex \"expression\"). Matches the value of the field against the unanchored regex and only keeps those events that match in the case of '=' or do not match in the case of '!='. If no field is specified, the match is against \"_raw\".",
  "related": [
    "rex",
    "search"
  ],
  "tags": [
    "regex",
    "regular",
    "expression",
    "filter",
    "where"
  ]
};

/**
 * relevancy command
 *
 * Category: fields::add
 * Description: Calculates the 'relevancy' field based on how well the events _raw field matches the keywords of the 'search'.  Useful for retrieving the best matching events/documents, rather than the default time-based ordering. Events score a higher relevancy if they have more rare search keywords, more frequently, in fewer terms.  For example a search for "disk error" will favor a short event/document that has 'disk' (a rare term) several times and 'error' once, than a very large event that has 'disk' once and 'error' several times.
 */
export const relevancyCommand: CommandSyntax = {
  "command": "relevancy",
  "syntax": {
    "kind": "literal",
    "value": "relevancy"
  },
  "category": "fields::add",
  "description": "Calculates the 'relevancy' field based on how well the events _raw field matches the keywords of the 'search'.  Useful for retrieving the best matching events/documents, rather than the default time-based ordering. Events score a higher relevancy if they have more rare search keywords, more frequently, in fewer terms.  For example a search for \"disk error\" will favor a short event/document that has 'disk' (a rare term) several times and 'error' once, than a very large event that has 'disk' once and 'error' several times.",
  "related": [
    "abstract",
    "highlight",
    "sort"
  ],
  "tags": [
    "search",
    "relevance",
    "precision",
    "text",
    "doc",
    "ir"
  ]
};

/**
 * reltime command
 *
 * Category: formatting
 * Description: Sets the 'reltime' field to a human readable value of the difference between 'now' and '_time'.  Human-readable values look like "5 days ago", "1 minute ago", "2 years ago", etc.
 */
export const reltimeCommand: CommandSyntax = {
  "command": "reltime",
  "syntax": {
    "kind": "literal",
    "value": "reltime"
  },
  "category": "formatting",
  "description": "Sets the 'reltime' field to a human readable value of the difference between 'now' and '_time'.  Human-readable values look like \"5 days ago\", \"1 minute ago\", \"2 years ago\", etc.",
  "related": [
    "convert"
  ],
  "tags": [
    "time",
    "ago"
  ]
};

/**
 * rename command
 *
 * Category: fields::modify
 * Description: Renames a field. If both the source and destination fields are  wildcard expressions with he same number of wildcards, the renaming will carry over the wildcarded portions to the destination expression.
 */
export const renameCommand: CommandSyntax = {
  "command": "rename",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "rename"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "param",
              "type": "wc-field",
              "effect": "modifies"
            },
            {
              "kind": "literal",
              "value": "as"
            },
            {
              "kind": "param",
              "type": "wc-field",
              "effect": "modifies"
            }
          ]
        },
        "quantifier": "+"
      }
    ]
  },
  "category": "fields::modify",
  "description": "Renames a field. If both the source and destination fields are  wildcard expressions with he same number of wildcards, the renaming will carry over the wildcarded portions to the destination expression.",
  "related": [
    "fields"
  ],
  "tags": [
    "rename",
    "alias",
    "name",
    "as",
    "aka"
  ]
};

/**
 * replace command
 *
 * Category: fields::modify
 * Description: Replaces a single occurrence of the first string with the second  within the specified fields (or all fields if none were specified). Non-wildcard replacements specified later take precedence over those specified earlier. For wildcard replacement, fuller matches take precedence over lesser matches. To assure precedence relationships, one is advised to split the replace into two separate invocations. When using wildcarded replacements, the result must have the same number of wildcards, or none at all. Wildcards (*) can be used to specify many values to replace, or replace values with.
 */
export const replaceCommand: CommandSyntax = {
  "command": "replace",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "replace"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "param",
              "type": "field",
              "effect": "modifies"
            },
            {
              "kind": "literal",
              "value": "with"
            },
            {
              "kind": "param",
              "type": "field",
              "effect": "modifies"
            }
          ]
        },
        "quantifier": "+"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "literal",
              "value": "in"
            },
            {
              "kind": "param",
              "type": "field-list",
              "effect": "modifies"
            }
          ]
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "fields::modify",
  "description": "Replaces a single occurrence of the first string with the second  within the specified fields (or all fields if none were specified). Non-wildcard replacements specified later take precedence over those specified earlier. For wildcard replacement, fuller matches take precedence over lesser matches. To assure precedence relationships, one is advised to split the replace into two separate invocations. When using wildcarded replacements, the result must have the same number of wildcards, or none at all. Wildcards (*) can be used to specify many values to replace, or replace values with.",
  "related": [
    "fillnull setfields rename"
  ],
  "tags": [
    "replace",
    "change",
    "set"
  ]
};

/**
 * reverse command
 *
 * Category: results::order
 * Description: Reverses the order of the results.
 */
export const reverseCommand: CommandSyntax = {
  "command": "reverse",
  "syntax": {
    "kind": "literal",
    "value": "reverse"
  },
  "category": "results::order",
  "description": "Reverses the order of the results.",
  "related": [
    "head",
    "sort",
    "tail"
  ],
  "tags": [
    "reverse",
    "flip",
    "invert",
    "inverse",
    "upsidedown"
  ]
};

/**
 * rtorder command
 *
 * Category: unknown
 * Description: The rtorder command creates a streaming event buffer that takes input events, stores them  in the buffer in ascending time order. The events are emitted in that order from the buffer only after the current time reaches at least the span of time given by buffer_span after the timestamp of the event.  The buffer_span is by default 10 seconds. Events are emitted from the buffer if the maximum size of the buffer is exceeded. The default max_buffer_size is 50000, or the max_result_rows setting of the [search] stanza in the limits.conf file.  If an event is received as input that is earlier than an event that has been emitted previously, that out of order event is emitted immediately unless the discard option is set to true (it is false by default). When discard is set to true, out of order events are discarded, assuring that the output is always strictly in time ascending order.
 */
export const rtorderCommand: CommandSyntax = {
  "command": "rtorder",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "rtorder"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "discard"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "buffer_span"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "max_buffer_size"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "unknown",
  "description": "The rtorder command creates a streaming event buffer that takes input events, stores them  in the buffer in ascending time order. The events are emitted in that order from the buffer only after the current time reaches at least the span of time given by buffer_span after the timestamp of the event.  The buffer_span is by default 10 seconds. Events are emitted from the buffer if the maximum size of the buffer is exceeded. The default max_buffer_size is 50000, or the max_result_rows setting of the [search] stanza in the limits.conf file.  If an event is received as input that is earlier than an event that has been emitted previously, that out of order event is emitted immediately unless the discard option is set to true (it is false by default). When discard is set to true, out of order events are discarded, assuring that the output is always strictly in time ascending order.",
  "related": [
    "sort"
  ],
  "tags": [
    "realtime",
    "sort",
    "order"
  ]
};

/**
 * runshellscript command
 *
 * Category: search::external
 * Description: Internal command used to execute scripted alerts. The script file needs to be located  in either $SPLUNK_HOME/etc/system/bin/scripts OR $SPLUNK_HOME/etc/apps/<app-name>/bin/scripts. The search id is used to create a path to the search's results. All other args are passed to the script (unvalidated) as follows: \i\ $0 = scriptname \i\ $1 = number of events returned \i\ $2 = search terms \i\ $3 = fully qualified query string \i\ $4 = name of saved splunk \i\ $5 = trigger reason (i.e. "The number of events was greater than 1") \i\ $6 = link to saved search \i\ $7 = DEPRECATED - empty string argument \i\ $8 = file where the results for this search are stored(contains raw results)
 */
export const runshellscriptCommand: CommandSyntax = {
  "command": "runshellscript",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "runshellscript"
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  },
  "category": "search::external",
  "description": "Internal command used to execute scripted alerts. The script file needs to be located  in either $SPLUNK_HOME/etc/system/bin/scripts OR $SPLUNK_HOME/etc/apps/<app-name>/bin/scripts. The search id is used to create a path to the search's results. All other args are passed to the script (unvalidated) as follows: \\i\\ $0 = scriptname \\i\\ $1 = number of events returned \\i\\ $2 = search terms \\i\\ $3 = fully qualified query string \\i\\ $4 = name of saved splunk \\i\\ $5 = trigger reason (i.e. \"The number of events was greater than 1\") \\i\\ $6 = link to saved search \\i\\ $7 = DEPRECATED - empty string argument \\i\\ $8 = file where the results for this search are stored(contains raw results)",
  "related": [
    "script"
  ],
  "tags": []
};

/**
 * savedsearch command
 *
 * Category: results::generate
 * Description: Runs a saved search.  If the search contains replacement terms, will perform string replacement. For example, if the search were something like "index=$indexname$", then the indexname term can be provided at invocation time of the savedsearch command.
 */
export const savedsearchCommand: CommandSyntax = {
  "command": "savedsearch",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "savedsearch"
      },
      {
        "kind": "param",
        "type": "string"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "*"
      }
    ]
  },
  "category": "results::generate",
  "description": "Runs a saved search.  If the search contains replacement terms, will perform string replacement. For example, if the search were something like \"index=$indexname$\", then the indexname term can be provided at invocation time of the savedsearch command.",
  "related": [
    "search"
  ],
  "tags": [
    "search",
    "macro",
    "saved",
    "bookmark"
  ]
};

/**
 * script command
 *
 * Category: search::external
 * Description: Calls an external python program that can modify or generate search results.   Scripts must be declared in commands.conf and be located in "$SPLUNK_HOME/etc/apps/app_name/bin". The  scripts are run with "$SPLUNK_HOME/bin/python".
 */
export const scriptCommand: CommandSyntax = {
  "command": "script",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "script"
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "*"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "search::external",
  "description": "Calls an external python program that can modify or generate search results.   Scripts must be declared in commands.conf and be located in \"$SPLUNK_HOME/etc/apps/app_name/bin\". The  scripts are run with \"$SPLUNK_HOME/bin/python\".",
  "related": [],
  "tags": [
    "script",
    "run",
    "python",
    "perl",
    "custom"
  ]
};

/**
 * scrub command
 *
 * Category: formatting
 * Description: Anonymizes the search results by replacing identifying data - usernames, IP addresses, domain names, etc. - with fictional values that maintain the same word length. For example, it may turn the string user=carol@adalberto.com into user=aname@mycompany.com. This lets Splunk users share log data without revealing confidential or personal information. By default the dictionary and configuration files found in $SPLUNK_HOME/etc/anonymizer are used.  These can be overridden by specifying arguments to the scrub command.  The arguments exactly correspond to the settings in the stand-alone "splunk anonymize" command, and are documented there.  Anonymizes all attributes, exception those that start with "_" (except "_raw") or "date_", or the following attributes: "eventtype", "linecount", "punct", "sourcetype", "timeendpos", "timestartpos".  When using alternative filenames, they must not contain paths and refer to files located in $SPLUNK_HOME/etc/anonymizer, or the optional namespace="appname" must be used to specify an app supplying the files, and they will be read from $SPLUNK_HOME/etc/app/<appname>/anonymizer.
 */
export const scrubCommand: CommandSyntax = {
  "command": "scrub",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "scrub"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "public-terms"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "private-terms"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "name-terms"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "dictionary"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "timeconfig"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "namespace"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "formatting",
  "description": "Anonymizes the search results by replacing identifying data - usernames, IP addresses, domain names, etc. - with fictional values that maintain the same word length. For example, it may turn the string user=carol@adalberto.com into user=aname@mycompany.com. This lets Splunk users share log data without revealing confidential or personal information. By default the dictionary and configuration files found in $SPLUNK_HOME/etc/anonymizer are used.  These can be overridden by specifying arguments to the scrub command.  The arguments exactly correspond to the settings in the stand-alone \"splunk anonymize\" command, and are documented there.  Anonymizes all attributes, exception those that start with \"_\" (except \"_raw\") or \"date_\", or the following attributes: \"eventtype\", \"linecount\", \"punct\", \"sourcetype\", \"timeendpos\", \"timestartpos\".  When using alternative filenames, they must not contain paths and refer to files located in $SPLUNK_HOME/etc/anonymizer, or the optional namespace=\"appname\" must be used to specify an app supplying the files, and they will be read from $SPLUNK_HOME/etc/app/<appname>/anonymizer.",
  "related": [],
  "tags": [
    "anonymize",
    "scrub",
    "secure",
    "private",
    "obfuscate"
  ]
};

/**
 * search command
 *
 * Category: search::search
 * Description: If the first search command, retrieve events from the indexes, using keywords, quoted phrases, wildcards, and key/value expressions; if not the first, filter results.
 */
export const searchCommand: CommandSyntax = {
  "command": "search",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "search"
      },
      {
        "kind": "param",
        "type": "evaled-field",
        "quantifier": "?"
      }
    ]
  },
  "category": "search::search",
  "description": "If the first search command, retrieve events from the indexes, using keywords, quoted phrases, wildcards, and key/value expressions; if not the first, filter results.",
  "related": [],
  "tags": [
    "search",
    "query",
    "find",
    "where",
    "filter",
    "daysago",
    "enddaysago",
    "endhoursago",
    "endminutesago",
    "endmonthsago",
    "endtime",
    "endtime",
    "eventtype",
    "eventtypetag",
    "host",
    "hosttag",
    "hoursago",
    "minutesago",
    "monthsago",
    "searchtimespandays",
    "searchtimespanhours",
    "searchtimespanminutes",
    "searchtimespanmonths",
    "source",
    "sourcetype",
    "startdaysago",
    "starthoursago",
    "startminutesago",
    "startmonthsago",
    "starttime",
    "starttimeu",
    "tag"
  ]
};

/**
 * searchtxn command
 *
 * Category: results::group
 * Description: Retrieves events matching the transactiontype TRANSACTION-NAME with events transitively discovered by the initial event constraint of the SEARCH-STRING.  \p\ For example, given an 'email' transactiontype with fields="qid pid" and with a search attribute of 'sourcetype="sendmail_syslog"', and a SEARCH-STRING of "to=root", searchtxn will find all the events that match 'sourcetype="sendmail_syslog" to=root'.\p\ From those results, all the qid's and pid's are transitively used to find further search for relevant events. When no more qid or pid values are found, the resulting search is run\i\ 'sourcetype="sendmail_syslog" ((qid=val1 pid=val1) OR ... ....(qid=valn pid=valm) | transaction name=email | search to=root'.\p\ Options:\p\ max_terms -- integer between 1-1000 which determines how many unique field values all fields can use (default=1000).  Using smaller values will speed up search, favoring more recent values\p\ use_disjunct -- determines if each term in SEARCH-STRING should be OR'd on the initial search (default=true)\p\ eventsonly -- if true, only the relevant events are retrieved, but the "|transaction" command is not run (default=false)
 */
export const searchtxnCommand: CommandSyntax = {
  "command": "searchtxn",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "searchtxn"
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "max_terms"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "use_disjunct"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "eventsonly"
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  },
  "category": "results::group",
  "description": "Retrieves events matching the transactiontype TRANSACTION-NAME with events transitively discovered by the initial event constraint of the SEARCH-STRING.  \\p\\ For example, given an 'email' transactiontype with fields=\"qid pid\" and with a search attribute of 'sourcetype=\"sendmail_syslog\"', and a SEARCH-STRING of \"to=root\", searchtxn will find all the events that match 'sourcetype=\"sendmail_syslog\" to=root'.\\p\\ From those results, all the qid's and pid's are transitively used to find further search for relevant events. When no more qid or pid values are found, the resulting search is run\\i\\ 'sourcetype=\"sendmail_syslog\" ((qid=val1 pid=val1) OR ... ....(qid=valn pid=valm) | transaction name=email | search to=root'.\\p\\ Options:\\p\\ max_terms -- integer between 1-1000 which determines how many unique field values all fields can use (default=1000).  Using smaller values will speed up search, favoring more recent values\\p\\ use_disjunct -- determines if each term in SEARCH-STRING should be OR'd on the initial search (default=true)\\p\\ eventsonly -- if true, only the relevant events are retrieved, but the \"|transaction\" command is not run (default=false)",
  "related": [
    "transaction"
  ],
  "tags": [
    "transaction",
    "group",
    "cluster",
    "collect",
    "gather",
    "needle",
    "winnow"
  ]
};

/**
 * select command
 *
 * Category: unknown
 * Description: Runs a SQL SELECT statement.
 */
export const selectCommand: CommandSyntax = {
  "command": "select",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "select"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  },
  "category": "unknown",
  "description": "Runs a SQL SELECT statement.",
  "related": [],
  "tags": []
};

/**
 * selfjoin command
 *
 * Category: results::filter
 * Description: Join results with itself, based on a specified field or list of fields to join on.
 */
export const selfjoinCommand: CommandSyntax = {
  "command": "selfjoin",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "selfjoin"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "*"
      },
      {
        "kind": "param",
        "type": "field-list"
      }
    ]
  },
  "category": "results::filter",
  "description": "Join results with itself, based on a specified field or list of fields to join on.",
  "related": [
    "join"
  ],
  "tags": [
    "join",
    "combine",
    "unite"
  ]
};

/**
 * sendemail command
 *
 * Category: alerting
 * Description: Emails search results to the specified email addresses.
 */
export const sendemailCommand: CommandSyntax = {
  "command": "sendemail",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "sendemail"
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "?"
      }
    ]
  },
  "category": "alerting",
  "description": "Emails search results to the specified email addresses.",
  "related": [],
  "tags": [
    "email",
    "mail",
    "alert"
  ]
};

/**
 * set command
 *
 * Category: search::subsearch
 * Description: Performs two subsearches and then executes the specified set operation on the two sets of search results.
 */
export const setCommand: CommandSyntax = {
  "command": "set",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "set"
      },
      {
        "kind": "alternation",
        "options": [
          {
            "kind": "literal",
            "value": "union"
          },
          {
            "kind": "literal",
            "value": "diff"
          },
          {
            "kind": "literal",
            "value": "intersect"
          }
        ]
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  },
  "category": "search::subsearch",
  "description": "Performs two subsearches and then executes the specified set operation on the two sets of search results.",
  "related": [
    "append",
    "appendcols",
    "join",
    "diff"
  ],
  "tags": [
    "diff",
    "union",
    "join",
    "intersect",
    "append"
  ]
};

/**
 * shape command
 *
 * Category: reporting
 * Description: Given a numeric multivalued FIELD, produce a 'shape'  attribute, describing the shape of the values, in a symbolic representation.  The symbolic representation will be at most MAXVALUES long and have at most MAXRESOLUTION different characters.  The defaults are MAXVALUES = 5 and MAXRESOLUTION = 10, normally producing a SHAPE value of 5 characters made up of 10 letters (a-k).
 */
export const shapeCommand: CommandSyntax = {
  "command": "shape",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "shape"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "maxvalues"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "maxresolution"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "reporting",
  "description": "Given a numeric multivalued FIELD, produce a 'shape'  attribute, describing the shape of the values, in a symbolic representation.  The symbolic representation will be at most MAXVALUES long and have at most MAXRESOLUTION different characters.  The defaults are MAXVALUES = 5 and MAXRESOLUTION = 10, normally producing a SHAPE value of 5 characters made up of 10 letters (a-k).",
  "related": [
    "anomalousvalue",
    "cluster",
    "kmeans",
    "outlier"
  ],
  "tags": [
    "summary",
    "symbolic"
  ]
};

/**
 * showargs command
 *
 * Category: unknown
 * Description: Treats the given string as a subsearch, executes that subsearch  and renders the results as an event. This is useful for debugging subsearches.
 */
export const showargsCommand: CommandSyntax = {
  "command": "showargs",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "showargs"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  },
  "category": "unknown",
  "description": "Treats the given string as a subsearch, executes that subsearch  and renders the results as an event. This is useful for debugging subsearches.",
  "related": [],
  "tags": []
};

/**
 * sichart command
 *
 * Category: index::summary
 * Description: Summary indexing friendly versions of chart command, using the same syntax.  Does not require explicitly knowing what statistics are necessary to store to the summary index in order to generate a report.
 */
export const sichartCommand: CommandSyntax = {
  "command": "sichart",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "sichart"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  },
  "category": "index::summary",
  "description": "Summary indexing friendly versions of chart command, using the same syntax.  Does not require explicitly knowing what statistics are necessary to store to the summary index in order to generate a report.",
  "related": [
    "collect",
    "overlap",
    "sirare",
    "sistats",
    "sitimechart",
    "sitop"
  ],
  "tags": [
    "chart",
    "summary",
    "index",
    "summaryindex"
  ]
};

/**
 * sirare command
 *
 * Category: index::summary
 * Description: Summary indexing friendly versions of rare command, using the same syntax.  Does not require explicitly knowing what statistics are necessary to store to the summary index in order to generate a report.
 */
export const sirareCommand: CommandSyntax = {
  "command": "sirare",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "sirare"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  },
  "category": "index::summary",
  "description": "Summary indexing friendly versions of rare command, using the same syntax.  Does not require explicitly knowing what statistics are necessary to store to the summary index in order to generate a report.",
  "related": [
    "collect",
    "overlap",
    "sichart",
    "sistats",
    "sitimechart",
    "sitop"
  ],
  "tags": [
    "rare",
    "summary",
    "index",
    "summaryindex"
  ]
};

/**
 * sistats command
 *
 * Category: index::summary
 * Description: Summary indexing friendly versions of stats command, using the same syntax.  Does not require explicitly knowing what statistics are necessary to store to the summary index in order to generate a report.
 */
export const sistatsCommand: CommandSyntax = {
  "command": "sistats",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "sistats"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  },
  "category": "index::summary",
  "description": "Summary indexing friendly versions of stats command, using the same syntax.  Does not require explicitly knowing what statistics are necessary to store to the summary index in order to generate a report.",
  "related": [
    "collect",
    "overlap",
    "sichart",
    "sirare",
    "sitop",
    "sitimechart"
  ],
  "tags": [
    "stats",
    "summary",
    "index",
    "summaryindex"
  ]
};

/**
 * sitimechart command
 *
 * Category: index::summary
 * Description: Summary indexing friendly versions of timechart command, using the same syntax.  Does not require explicitly knowing what statistics are necessary to store to the summary index in order to generate a report.
 */
export const sitimechartCommand: CommandSyntax = {
  "command": "sitimechart",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "sitimechart"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  },
  "category": "index::summary",
  "description": "Summary indexing friendly versions of timechart command, using the same syntax.  Does not require explicitly knowing what statistics are necessary to store to the summary index in order to generate a report.",
  "related": [
    "collect",
    "overlap",
    "sichart",
    "sirare",
    "sistats",
    "sitop"
  ],
  "tags": [
    "timechart",
    "summary",
    "index",
    "summaryindex"
  ]
};

/**
 * sitop command
 *
 * Category: index::summary
 * Description: Summary indexing friendly versions of top command, using the same syntax.  Does not require explicitly knowing what statistics are necessary to store to the summary index in order to generate a report.
 */
export const sitopCommand: CommandSyntax = {
  "command": "sitop",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "sitop"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  },
  "category": "index::summary",
  "description": "Summary indexing friendly versions of top command, using the same syntax.  Does not require explicitly knowing what statistics are necessary to store to the summary index in order to generate a report.",
  "related": [
    "collect",
    "overlap",
    "sichart",
    "sirare",
    "sistats",
    "sitimechart"
  ],
  "tags": [
    "top",
    "summary",
    "index",
    "summaryindex"
  ]
};

/**
 * sort command
 *
 * Category: results::order
 * Description: Sorts by the given list of fields. If more than one field is specified,  the first denotes the primary sort order, the second denotes the secondary, etc. If the fieldname is immediately (no space) preceded by "+", the sort is ascending (default). If the fieldname is immediately (no space) preceded by "-", the sort is descending. If white space follows "+/-", the sort order is applied to all following fields without a different explicit sort order. Also a trailing "d" or "desc" causes the results to be reversed. Results missing a given field are treated as having the smallest or largest possible value of that field if the order es descending or ascending respectively. If the field takes on numeric values, the collating sequence is numeric. If the field takes on IP address values, the collating sequence is for IPs. Otherwise, the collating sequence is lexicographic ordering. If the first term is a number, then at most that many results are returned (in order). If no number is specified, the default limit of 10000 is used.  If number is 0, all results will be returned.
 */
export const sortCommand: CommandSyntax = {
  "command": "sort",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "sort"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int"
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "quantifier": "+"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "alternation",
          "options": [
            {
              "kind": "literal",
              "value": "d"
            },
            {
              "kind": "literal",
              "value": "desc"
            }
          ]
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "results::order",
  "description": "Sorts by the given list of fields. If more than one field is specified,  the first denotes the primary sort order, the second denotes the secondary, etc. If the fieldname is immediately (no space) preceded by \"+\", the sort is ascending (default). If the fieldname is immediately (no space) preceded by \"-\", the sort is descending. If white space follows \"+/-\", the sort order is applied to all following fields without a different explicit sort order. Also a trailing \"d\" or \"desc\" causes the results to be reversed. Results missing a given field are treated as having the smallest or largest possible value of that field if the order es descending or ascending respectively. If the field takes on numeric values, the collating sequence is numeric. If the field takes on IP address values, the collating sequence is for IPs. Otherwise, the collating sequence is lexicographic ordering. If the first term is a number, then at most that many results are returned (in order). If no number is specified, the default limit of 10000 is used.  If number is 0, all results will be returned.",
  "related": [
    "reverse"
  ],
  "tags": [
    "arrange,",
    "order,",
    "rank,",
    "sort"
  ]
};

/**
 * spath command
 *
 * Category: fields::add
 * Description: When called with no path argument, spath extracts all fields from the  first 5000 (limit is configurable via limits.conf characters, with the produced fields named by their path. If a path is provided, the value of this path is extracted to a field named by the path by default, or to a field specified by the output argument if it is provided. Paths are of the form 'foo.bar.baz'.  Each level can also have an optional array index, delineated by curly brackets ex 'foo{1}.bar'. All array elements can be represented by empty curly brackets e.g. 'foo{}'. The final level for XML queries can also include an attribute name, also enclosed by curly brackets,  e.g. 'foo.bar{@title}'. By default, spath takes the whole event as its input.  The input argument can be used to specify a different field for the input source.
 */
export const spathCommand: CommandSyntax = {
  "command": "spath",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "spath"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "output",
          "effect": "creates"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "alternation",
          "options": [
            {
              "kind": "param",
              "type": "field",
              "name": "path",
              "effect": "creates"
            },
            {
              "kind": "param",
              "type": "field",
              "effect": "creates"
            }
          ]
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "input",
          "effect": "creates"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "fields::add",
  "description": "When called with no path argument, spath extracts all fields from the  first 5000 (limit is configurable via limits.conf characters, with the produced fields named by their path. If a path is provided, the value of this path is extracted to a field named by the path by default, or to a field specified by the output argument if it is provided. Paths are of the form 'foo.bar.baz'.  Each level can also have an optional array index, delineated by curly brackets ex 'foo{1}.bar'. All array elements can be represented by empty curly brackets e.g. 'foo{}'. The final level for XML queries can also include an attribute name, also enclosed by curly brackets,  e.g. 'foo.bar{@title}'. By default, spath takes the whole event as its input.  The input argument can be used to specify a different field for the input source.",
  "related": [
    "rex",
    "regex"
  ],
  "tags": [
    "spath",
    "xpath",
    "json",
    "xml",
    "extract"
  ]
};

/**
 * stats command
 *
 * Category: reporting
 * Description: Calculate aggregate statistics over the dataset, optionally grouped by a list of fields. Aggregate statistics include: \i\ * count, distinct count \i\ * mean, median, mode \i\ * min, max, range, percentiles \i\ * standard deviation, variance \i\ * sum \i\ * earliest and latest occurrence \i\ * first and last (according to input order into stats command) occurrence \p\ Similar to SQL aggregation. If called without a by-clause, one row is produced, which represents the aggregation over the entire incoming result set. If called with a by-clause, one row is produced for each distinct value of the by-clause. The 'partitions' option, if specified, allows stats to partition the input data based on the split-by fields for multithreaded reduce. The 'allnum' option, if true (default = false), computes numerical statistics on each field if and only if all of the values of that field are numerical. The 'delim' option is used to specify how the values in the 'list' or 'values' aggregation are delimited.  (default is a single space) When called with the name "prestats", it will produce intermediate results (internal).
 */
export const statsCommand: CommandSyntax = {
  "command": "stats",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "stats"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      }
    ]
  },
  "category": "reporting",
  "description": "Calculate aggregate statistics over the dataset, optionally grouped by a list of fields. Aggregate statistics include: \\i\\ * count, distinct count \\i\\ * mean, median, mode \\i\\ * min, max, range, percentiles \\i\\ * standard deviation, variance \\i\\ * sum \\i\\ * earliest and latest occurrence \\i\\ * first and last (according to input order into stats command) occurrence \\p\\ Similar to SQL aggregation. If called without a by-clause, one row is produced, which represents the aggregation over the entire incoming result set. If called with a by-clause, one row is produced for each distinct value of the by-clause. The 'partitions' option, if specified, allows stats to partition the input data based on the split-by fields for multithreaded reduce. The 'allnum' option, if true (default = false), computes numerical statistics on each field if and only if all of the values of that field are numerical. The 'delim' option is used to specify how the values in the 'list' or 'values' aggregation are delimited.  (default is a single space) When called with the name \"prestats\", it will produce intermediate results (internal).",
  "related": [
    "eventstats",
    "rare",
    "sistats",
    "streamstats",
    "top"
  ],
  "tags": [
    "stats",
    "statistics",
    "event",
    "sparkline",
    "count",
    "dc",
    "mean",
    "avg",
    "stdev",
    "var",
    "min",
    "max",
    "mode",
    "median"
  ]
};

/**
 * strcat command
 *
 * Category: fields::add
 * Description: Stitch together fields and/or strings to create a new field.   Quoted tokens are assumed to be literals and the rest field names. The destination field name is always at the end. If allrequired=t, for each event the destination field is only written to if all source fields exist.  If allrequired=f (default) the destination field is always written and any source fields that do not exist are treated as empty string.
 */
export const strcatCommand: CommandSyntax = {
  "command": "strcat",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "strcat"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "allrequired"
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "creates"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "creates"
      }
    ]
  },
  "category": "fields::add",
  "description": "Stitch together fields and/or strings to create a new field.   Quoted tokens are assumed to be literals and the rest field names. The destination field name is always at the end. If allrequired=t, for each event the destination field is only written to if all source fields exist.  If allrequired=f (default) the destination field is always written and any source fields that do not exist are treated as empty string.",
  "related": [
    "eval"
  ],
  "tags": [
    "strcat",
    "concat",
    "string",
    "append"
  ]
};

/**
 * streamedcsv command
 *
 * Category: unknown
 * Description: Internal command to test dispatch.
 */
export const streamedcsvCommand: CommandSyntax = {
  "command": "streamedcsv",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "streamedcsv"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int",
          "name": "chunk"
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "string"
      }
    ]
  },
  "category": "unknown",
  "description": "Internal command to test dispatch.",
  "related": [],
  "tags": []
};

/**
 * surrounding command
 *
 * Category: unknown
 * Description: Finds events surrounding the event specified by event-id filtered by the search keys.
 */
export const surroundingCommand: CommandSyntax = {
  "command": "surrounding",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "surrounding"
      },
      {
        "kind": "param",
        "type": "field",
        "name": "id"
      },
      {
        "kind": "param",
        "type": "int",
        "name": "timebefore"
      },
      {
        "kind": "param",
        "type": "int",
        "name": "timeafter"
      },
      {
        "kind": "param",
        "type": "field",
        "name": "searchkeys"
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "param",
        "type": "field",
        "name": "readlevel"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  },
  "category": "unknown",
  "description": "Finds events surrounding the event specified by event-id filtered by the search keys.",
  "related": [],
  "tags": []
};

/**
 * table command
 *
 * Category: results::filter
 * Description: Returns a table formed by only the fields specified in the arguments. Columns are  displayed in the same order that fields are specified. Column headers are the field names. Rows are the field values. Each row represents an event.
 */
export const tableCommand: CommandSyntax = {
  "command": "table",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "table"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  },
  "category": "results::filter",
  "description": "Returns a table formed by only the fields specified in the arguments. Columns are  displayed in the same order that fields are specified. Column headers are the field names. Rows are the field values. Each row represents an event.",
  "related": [
    "fields"
  ],
  "tags": [
    "fields"
  ]
};

/**
 * tagcreate command
 *
 * Category: unknown
 * Description: Sets the tag on each fielded value.
 */
export const tagcreateCommand: CommandSyntax = {
  "command": "tagcreate",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "tagcreate"
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  },
  "category": "unknown",
  "description": "Sets the tag on each fielded value.",
  "related": [],
  "tags": []
};

/**
 * tagdelete command
 *
 * Category: unknown
 * Description: Deletes the tag from each fielded value if they were tagged with tag.
 */
export const tagdeleteCommand: CommandSyntax = {
  "command": "tagdelete",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "tagdelete"
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  },
  "category": "unknown",
  "description": "Deletes the tag from each fielded value if they were tagged with tag.",
  "related": [],
  "tags": []
};

/**
 * tags command
 *
 * Category: fields::add
 * Description: Annotate the search results with tags. If there are fields specified only annotate tags for those fields otherwise look for tags for all fields.  If outputfield is specified, the tags for all fields will be written to this field.  Otherwise, the tags for each field will be written to a field named tag::<field>.  If outputfield is specified, inclname and inclvalue control whether or not the field name and field values are added to the output field.  By default only the tag itself is written to the outputfield.  E.g.: (<field>::)?(<value>::)?tag
 */
export const tagsCommand: CommandSyntax = {
  "command": "tags",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "tags"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "outputfield",
          "effect": "creates"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "inclname"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "inclvalue"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "effect": "creates"
        },
        "quantifier": "*"
      }
    ]
  },
  "category": "fields::add",
  "description": "Annotate the search results with tags. If there are fields specified only annotate tags for those fields otherwise look for tags for all fields.  If outputfield is specified, the tags for all fields will be written to this field.  Otherwise, the tags for each field will be written to a field named tag::<field>.  If outputfield is specified, inclname and inclvalue control whether or not the field name and field values are added to the output field.  By default only the tag itself is written to the outputfield.  E.g.: (<field>::)?(<value>::)?tag",
  "related": [
    "eval"
  ],
  "tags": [
    "tags"
  ]
};

/**
 * tagset command
 *
 * Category: unknown
 * Description: Sets the tags for the fielded value to be the tag list. Other tags are deleted.
 */
export const tagsetCommand: CommandSyntax = {
  "command": "tagset",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "tagset"
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  },
  "category": "unknown",
  "description": "Sets the tags for the fielded value to be the tag list. Other tags are deleted.",
  "related": [],
  "tags": []
};

/**
 * tail command
 *
 * Category: results::order
 * Description: Returns the last n results, or 10 if no integer is specified.  The events are returned in reverse order, starting at the end of the result set.
 */
export const tailCommand: CommandSyntax = {
  "command": "tail",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "tail"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "results::order",
  "description": "Returns the last n results, or 10 if no integer is specified.  The events are returned in reverse order, starting at the end of the result set.",
  "related": [
    "head",
    "reverse"
  ],
  "tags": [
    "tail",
    "last",
    "bottom",
    "trailing",
    "earliest"
  ]
};

/**
 * timechart command
 *
 * Category: reporting
 * Description: Creates a chart for a statistical aggregation applied to a field against time. When  the data is split by a field, each distinct value of this split-by field is a series. If used with an eval-expression, the split-by-clause is required. \p\ When a where clause is not provided, you can use limit and agg options to specify series filtering. If limit=0, there is no series filtering. \p\ When specifying multiple data series with a split-by-clause, you can use sep and format options to construct output field names.\p\ When called without any bin-options, timechart defaults to bins=300. This finds the smallest bucket size that results in no more than three hundred distinct buckets.
 */
export const timechartCommand: CommandSyntax = {
  "command": "timechart",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "timechart"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      }
    ]
  },
  "category": "reporting",
  "description": "Creates a chart for a statistical aggregation applied to a field against time. When  the data is split by a field, each distinct value of this split-by field is a series. If used with an eval-expression, the split-by-clause is required. \\p\\ When a where clause is not provided, you can use limit and agg options to specify series filtering. If limit=0, there is no series filtering. \\p\\ When specifying multiple data series with a split-by-clause, you can use sep and format options to construct output field names.\\p\\ When called without any bin-options, timechart defaults to bins=300. This finds the smallest bucket size that results in no more than three hundred distinct buckets.",
  "related": [
    "bucket",
    "chart",
    "sitimechart"
  ],
  "tags": [
    "chart",
    "graph",
    "report",
    "count",
    "dc",
    "mean",
    "avg",
    "stdev",
    "var",
    "min",
    "max",
    "mode",
    "median",
    "per_second",
    "per_minute",
    "per_hour",
    "per_day"
  ]
};

/**
 * top command
 *
 * Category: reporting
 * Description: Finds the most frequent tuple of values of all fields in the field list, along with a count and percentage. If a the optional by-clause is provided, finds the most frequent values for each distinct tuple of values of the group-by fields.
 */
export const topCommand: CommandSyntax = {
  "command": "top",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "top"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      }
    ]
  },
  "category": "reporting",
  "description": "Finds the most frequent tuple of values of all fields in the field list, along with a count and percentage. If a the optional by-clause is provided, finds the most frequent values for each distinct tuple of values of the group-by fields.",
  "related": [
    "rare",
    "sitop",
    "stats"
  ],
  "tags": [
    "top",
    "popular",
    "common",
    "many",
    "frequent",
    "typical"
  ]
};

/**
 * transaction command
 *
 * Category: results::group
 * Description: Groups events into transactions based on various constraints, such as the beginning  and ending strings or time between events. Transactions are made up of the raw text (the _raw field) of each member, the time and date fields of the earliest member, as well as the union of all other fields of each member.\p\ Produces two fields to the raw events, duration and eventcount. The duration value is the difference between the timestamps for the first and last events in the transaction. The eventcount value is the number of events in the transaction.
 */
export const transactionCommand: CommandSyntax = {
  "command": "transaction",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "transaction"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field-list"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "name"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "*"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "*"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "*"
      }
    ]
  },
  "category": "results::group",
  "description": "Groups events into transactions based on various constraints, such as the beginning  and ending strings or time between events. Transactions are made up of the raw text (the _raw field) of each member, the time and date fields of the earliest member, as well as the union of all other fields of each member.\\p\\ Produces two fields to the raw events, duration and eventcount. The duration value is the difference between the timestamps for the first and last events in the transaction. The eventcount value is the number of events in the transaction.",
  "related": [
    "searchtxn"
  ],
  "tags": [
    "transaction",
    "group",
    "cluster",
    "collect",
    "gather"
  ]
};

/**
 * transpose command
 *
 * Category: reporting
 * Description: Turns rows into columns (each row becomes a column).  Takes an optional integer argument that limits the number of rows we transpose (default = 5).  column_name is the name of the field in the output where the names of the fields of the inputs will go (default = "column").  header_field, if provided, will use the value of this field in each input row as the name of the output field for that column (default = no field provided, output fields will be named "row 1", "row 2", ...).  include_empty is an optional boolean option, that if false, will exclude any field/column in the input that had no values for any row (defaults = true).
 */
export const transposeCommand: CommandSyntax = {
  "command": "transpose",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "transpose"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "int"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "column_name"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "header_field",
          "effect": "consumes"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "include_empty"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "reporting",
  "description": "Turns rows into columns (each row becomes a column).  Takes an optional integer argument that limits the number of rows we transpose (default = 5).  column_name is the name of the field in the output where the names of the fields of the inputs will go (default = \"column\").  header_field, if provided, will use the value of this field in each input row as the name of the output field for that column (default = no field provided, output fields will be named \"row 1\", \"row 2\", ...).  include_empty is an optional boolean option, that if false, will exclude any field/column in the input that had no values for any row (defaults = true).",
  "related": [
    "fields",
    "stats"
  ],
  "tags": [
    "fields,",
    "stats"
  ]
};

/**
 * trendline command
 *
 * Category: reporting
 * Description: Computes the moving averages of fields.  Current supported trend_types include  simple moving average (sma), exponential moving average(ema), and weighted moving average(wma) The output is written to a new field where the new field name can be explicitly specified or by default it is simply the trend_type + field.
 */
export const trendlineCommand: CommandSyntax = {
  "command": "trendline",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "trendline"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "param",
              "type": "field",
              "effect": "consumes"
            },
            {
              "kind": "literal",
              "value": "("
            },
            {
              "kind": "param",
              "type": "field",
              "effect": "consumes"
            },
            {
              "kind": "literal",
              "value": ")"
            },
            {
              "kind": "group",
              "pattern": {
                "kind": "sequence",
                "patterns": [
                  {
                    "kind": "literal",
                    "value": "as"
                  },
                  {
                    "kind": "param",
                    "type": "field",
                    "effect": "consumes"
                  }
                ]
              },
              "quantifier": "?"
            }
          ]
        },
        "quantifier": "+"
      }
    ]
  },
  "category": "reporting",
  "description": "Computes the moving averages of fields.  Current supported trend_types include  simple moving average (sma), exponential moving average(ema), and weighted moving average(wma) The output is written to a new field where the new field name can be explicitly specified or by default it is simply the trend_type + field.",
  "related": [
    "accum",
    "autoregress",
    "delta",
    "streamstats",
    "trendline"
  ],
  "tags": [
    "average",
    "mean"
  ]
};

/**
 * tscollect command
 *
 * Category: reporting
 * Description: Writes the result table into *.tsidx files, for later use by tstats command.  Only non-internal fields and values are written to the tsidx files. squashcase is false by default; if true, the field *values* are converted to lowercase when writing them to the *.tsidx files. If namespace is provided, the tsidx files are written to a directory of that name under the main tsidx stats directory. These namespaces can be written to multiple times to add new data. If namespace is not provided, the files are written to a directory within the job directory of that search, and will live as long as the job does. If keepresults is set to true, tscollect will output the same results it received as input. By default this is false, and only emits a count of results processed (this is more efficient as we do not need to store as many results). The 'indexes_edit' capability is required to run this command.
 */
export const tscollectCommand: CommandSyntax = {
  "command": "tscollect",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "tscollect"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "namespace"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "squashcase"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "keepresults"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "reporting",
  "description": "Writes the result table into *.tsidx files, for later use by tstats command.  Only non-internal fields and values are written to the tsidx files. squashcase is false by default; if true, the field *values* are converted to lowercase when writing them to the *.tsidx files. If namespace is provided, the tsidx files are written to a directory of that name under the main tsidx stats directory. These namespaces can be written to multiple times to add new data. If namespace is not provided, the files are written to a directory within the job directory of that search, and will live as long as the job does. If keepresults is set to true, tscollect will output the same results it received as input. By default this is false, and only emits a count of results processed (this is more efficient as we do not need to store as many results). The 'indexes_edit' capability is required to run this command.",
  "related": [
    "tstats"
  ],
  "tags": [
    "tscollect",
    "tsidx",
    "projection"
  ]
};

/**
 * tstats command
 *
 * Category: reporting
 * Description: Performs statistical queries on indexed fields in tsidx files. You can select from TSIDX data in several different ways:                                  \p\ 1. Normal index data: If you do not supply a FROM clause, we will select from index data in the same way as search. You are restricted to selecting from your allowed indexes by role, and you can control exactly which indexes you select from in the WHERE clause. If no indexes are mentioned in the WHERE clause search, we will use your default set of indexes. By default, role-based search filters are applied, but can be turned off in limits.conf. \p\ 2. Data manually collected with 'tscollect': Select from your namespace with 'FROM <namespace>'. If you supplied no namespace to tscollect, the data was collected into the dispatch directory of that job. In that case, you would select from that data with 'FROM sid=<tscollect-job-id>'                \p\ 3. An accelerated datamodel: Select from this accelerated datamodel with 'FROM datamodel=<datamodel-name>' You can provide any number of aggregates to perform, and also have the option of providing a filtering query using the WHERE keyword. This query looks like a normal query you would use in the search processor. You can also provide any number of GROUPBY fields. If you are grouping by _time, you should supply a timespan with 'span' for grouping the time buckets. This timespan looks like any normal timespan in Splunk, like '1hr' or '3d'. It also supports 'auto'.     \p\ Arguments:                                                                                                                                                \i\ "prestats": This simply outputs the answer in prestats format, in case you want to pipe the results to a                                                  \i\ different type of processor that takes prestats output, like chart or timechart. This is very useful for                                      \i\ creating graphs                                                                                                                               \i\ "local": If you set this to true it forces the processor to only be run on the search head.                                                               \i\ "append": Only valid in prestats mode, this allows tstats to be run to add results to an existing set of                                                  \i\ results, instead of generating them.                                                                                                            \i\ "summariesonly": Only applies when selecting from an accelerated datamodel.  When false (default),                                                        \i\ Splunk will generate results from both summarized data, as well as for data that is not                                                  \i\ summarized. For data not summarized as TSIDX data, the full search behavior will be used                                                 \i\ against the original index data.  If set to true, 'tstats' will only generate results from the                                           \i\ TSIDX data that has been automatically generated by the acceleration, and nonsummarized data                                             \i\ will not be provided.                                                                                                                    \i\ "allow_old_summaries": Only applies when selecting from an accelerated datamodel.  When false                                                             \i\ (default), Splunk only provides results from summary directories when those directories are up-to-date.                            \i\ In other words, if the datamodel definition has changed, we do not use those summary directories                                   \i\ which are older than the new definition when producing output from tstats. This default ensures                                    \i\ that the output from tstats will always reflect your current configuration. If this is instead                                     \i\ set to true, then tstats will use both current summary data as well as summary data that was                                        \i\ generated prior to the definition change. Essentially this is an advanced performance                                              \i\ feature for cases where you know that the old summaries are "good enough".                                                         \i\ "chunk_size": Advanced option. This argument controls how many events are retrieved at a time within                                                      \i\ a single TSIDX file when answering queries. The default is 10000000. Only consider supplying a lower                                        \i\ value for this if you find a particular query is using too much memory. The case that could cause this                                      \i\ would be an excessively high cardinality split-by, such as grouping by several fields that have a very                                      \i\ large amount of distinct values. Setting this value too low, however, can negatively impact the overall                                     \i\ runtime of your query.                                                                                                                      \p\ NOTE: Except in 'append=t' mode, this is a generating processor, so it must be the first command in a search.
 */
export const tstatsCommand: CommandSyntax = {
  "command": "tstats",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "tstats"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "prestats"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "local"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "append"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "summariesonly"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "allow_old_summaries"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "chunk_size",
          "effect": "consumes"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "stats-func"
        },
        "quantifier": "+"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "alternation",
          "options": [
            {
              "kind": "sequence",
              "patterns": [
                {
                  "kind": "literal",
                  "value": "FROM"
                },
                {
                  "kind": "param",
                  "type": "field",
                  "effect": "consumes"
                }
              ]
            },
            {
              "kind": "param",
              "type": "field",
              "name": "sid",
              "effect": "consumes"
            },
            {
              "kind": "param",
              "type": "field",
              "name": "datamodel",
              "effect": "consumes"
            }
          ]
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "literal",
              "value": "WHERE"
            },
            {
              "kind": "param",
              "type": "evaled-field"
            }
          ]
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "alternation",
              "options": [
                {
                  "kind": "literal",
                  "value": "by"
                },
                {
                  "kind": "literal",
                  "value": "GROUPBY"
                }
              ]
            },
            {
              "kind": "param",
              "type": "field-list",
              "effect": "consumes"
            },
            {
              "kind": "group",
              "pattern": {
                "kind": "param",
                "type": "field",
                "name": "span",
                "effect": "consumes"
              },
              "quantifier": "?"
            }
          ]
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "reporting",
  "description": "Performs statistical queries on indexed fields in tsidx files. You can select from TSIDX data in several different ways:                                  \\p\\ 1. Normal index data: If you do not supply a FROM clause, we will select from index data in the same way as search. You are restricted to selecting from your allowed indexes by role, and you can control exactly which indexes you select from in the WHERE clause. If no indexes are mentioned in the WHERE clause search, we will use your default set of indexes. By default, role-based search filters are applied, but can be turned off in limits.conf. \\p\\ 2. Data manually collected with 'tscollect': Select from your namespace with 'FROM <namespace>'. If you supplied no namespace to tscollect, the data was collected into the dispatch directory of that job. In that case, you would select from that data with 'FROM sid=<tscollect-job-id>'                \\p\\ 3. An accelerated datamodel: Select from this accelerated datamodel with 'FROM datamodel=<datamodel-name>' You can provide any number of aggregates to perform, and also have the option of providing a filtering query using the WHERE keyword. This query looks like a normal query you would use in the search processor. You can also provide any number of GROUPBY fields. If you are grouping by _time, you should supply a timespan with 'span' for grouping the time buckets. This timespan looks like any normal timespan in Splunk, like '1hr' or '3d'. It also supports 'auto'.     \\p\\ Arguments:                                                                                                                                                \\i\\ \"prestats\": This simply outputs the answer in prestats format, in case you want to pipe the results to a                                                  \\i\\ different type of processor that takes prestats output, like chart or timechart. This is very useful for                                      \\i\\ creating graphs                                                                                                                               \\i\\ \"local\": If you set this to true it forces the processor to only be run on the search head.                                                               \\i\\ \"append\": Only valid in prestats mode, this allows tstats to be run to add results to an existing set of                                                  \\i\\ results, instead of generating them.                                                                                                            \\i\\ \"summariesonly\": Only applies when selecting from an accelerated datamodel.  When false (default),                                                        \\i\\ Splunk will generate results from both summarized data, as well as for data that is not                                                  \\i\\ summarized. For data not summarized as TSIDX data, the full search behavior will be used                                                 \\i\\ against the original index data.  If set to true, 'tstats' will only generate results from the                                           \\i\\ TSIDX data that has been automatically generated by the acceleration, and nonsummarized data                                             \\i\\ will not be provided.                                                                                                                    \\i\\ \"allow_old_summaries\": Only applies when selecting from an accelerated datamodel.  When false                                                             \\i\\ (default), Splunk only provides results from summary directories when those directories are up-to-date.                            \\i\\ In other words, if the datamodel definition has changed, we do not use those summary directories                                   \\i\\ which are older than the new definition when producing output from tstats. This default ensures                                    \\i\\ that the output from tstats will always reflect your current configuration. If this is instead                                     \\i\\ set to true, then tstats will use both current summary data as well as summary data that was                                        \\i\\ generated prior to the definition change. Essentially this is an advanced performance                                              \\i\\ feature for cases where you know that the old summaries are \"good enough\".                                                         \\i\\ \"chunk_size\": Advanced option. This argument controls how many events are retrieved at a time within                                                      \\i\\ a single TSIDX file when answering queries. The default is 10000000. Only consider supplying a lower                                        \\i\\ value for this if you find a particular query is using too much memory. The case that could cause this                                      \\i\\ would be an excessively high cardinality split-by, such as grouping by several fields that have a very                                      \\i\\ large amount of distinct values. Setting this value too low, however, can negatively impact the overall                                     \\i\\ runtime of your query.                                                                                                                      \\p\\ NOTE: Except in 'append=t' mode, this is a generating processor, so it must be the first command in a search.",
  "related": [
    "tscollect"
  ],
  "tags": [
    "tstats",
    "tsidx",
    "projection"
  ]
};

/**
 * typeahead command
 *
 * Category: administrative
 * Description: Returns typeahead on a specified prefix. Only returns a max of "count" results, can be targeted to an index and restricted by time.  If index specifiers are provided they're used to populate the set of indexes used if no index specifiers are found in the prefix.
 */
export const typeaheadCommand: CommandSyntax = {
  "command": "typeahead",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "typeahead"
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "administrative",
  "description": "Returns typeahead on a specified prefix. Only returns a max of \"count\" results, can be targeted to an index and restricted by time.  If index specifiers are provided they're used to populate the set of indexes used if no index specifiers are found in the prefix.",
  "related": [],
  "tags": [
    "typeahead",
    "help",
    "terms"
  ]
};

/**
 * typelearner command
 *
 * Category: results::group
 * Description: Takes previous search results, and produces a list of promising searches that may be used as event-types.
 */
export const typelearnerCommand: CommandSyntax = {
  "command": "typelearner",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "typelearner"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "results::group",
  "description": "Takes previous search results, and produces a list of promising searches that may be used as event-types.",
  "related": [
    "findtypes",
    "typer"
  ],
  "tags": [
    "eventtype",
    "typer",
    "discover",
    "search",
    "classify"
  ]
};

/**
 * typer command
 *
 * Category: results::group
 * Description: Calculates the 'eventtype' field for search results that match a known event-type.
 */
export const typerCommand: CommandSyntax = {
  "command": "typer",
  "syntax": {
    "kind": "literal",
    "value": "typer"
  },
  "category": "results::group",
  "description": "Calculates the 'eventtype' field for search results that match a known event-type.",
  "related": [
    "typelearner"
  ],
  "tags": [
    "eventtype",
    "typer",
    "discover",
    "search",
    "classify"
  ]
};

/**
 * union command
 *
 * Category: results::append
 * Description: Merges the results from two or more datasets into one dataset.
 */
export const unionCommand: CommandSyntax = {
  "command": "union",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "union"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field"
        },
        "quantifier": "*"
      }
    ]
  },
  "category": "results::append",
  "description": "Merges the results from two or more datasets into one dataset.",
  "related": [
    "multisearch",
    "append"
  ],
  "tags": [
    "multisearch",
    "append"
  ]
};

/**
 * uniq command
 *
 * Category: results::filter
 * Description: Removes any search result that is an exact duplicate with the adjacent result before it.
 */
export const uniqCommand: CommandSyntax = {
  "command": "uniq",
  "syntax": {
    "kind": "literal",
    "value": "uniq"
  },
  "category": "results::filter",
  "description": "Removes any search result that is an exact duplicate with the adjacent result before it.",
  "related": [
    "dedup"
  ],
  "tags": [
    "uniq",
    "unique",
    "duplicate",
    "redundant",
    "extra"
  ]
};

/**
 * untable command
 *
 * Category: reporting
 * Description: Converts results from a tabular format to a format similar to stats output.  Inverse of xyseries.
 */
export const untableCommand: CommandSyntax = {
  "command": "untable",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "untable"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      }
    ]
  },
  "category": "reporting",
  "description": "Converts results from a tabular format to a format similar to stats output.  Inverse of xyseries.",
  "related": [
    "xyseries"
  ],
  "tags": [
    "convert",
    "table"
  ]
};

/**
 * where command
 *
 * Category: results::filter
 * Description: Keeps only the results for which the evaluation was successful and the boolean result was true.
 */
export const whereCommand: CommandSyntax = {
  "command": "where",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "where"
      },
      {
        "kind": "param",
        "type": "evaled-field"
      }
    ]
  },
  "category": "results::filter",
  "description": "Keeps only the results for which the evaluation was successful and the boolean result was true.",
  "related": [
    "eval search regex"
  ],
  "tags": [
    "where",
    "filter",
    "search"
  ]
};

/**
 * x11 command
 *
 * Category: reporting
 * Description: Remove seasonal fluctuations in fields. This command has a similar purpose to the trendline command, but is more sophisticated as it uses the industry popular X11 method. The type option can be either 'mult' (for multiplicative) or 'add' (for additive). By default, it's 'mult'. The period option should be specified if known; otherwise it is automatically computed.
 */
export const x11Command: CommandSyntax = {
  "command": "x11",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "x11"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      },
      {
        "kind": "literal",
        "value": "("
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      },
      {
        "kind": "literal",
        "value": ")"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "sequence",
          "patterns": [
            {
              "kind": "literal",
              "value": "as"
            },
            {
              "kind": "param",
              "type": "field",
              "effect": "consumes"
            }
          ]
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "reporting",
  "description": "Remove seasonal fluctuations in fields. This command has a similar purpose to the trendline command, but is more sophisticated as it uses the industry popular X11 method. The type option can be either 'mult' (for multiplicative) or 'add' (for additive). By default, it's 'mult'. The period option should be specified if known; otherwise it is automatically computed.",
  "related": [
    "trendline"
  ],
  "tags": [
    "x11",
    "deseasonal",
    "seasonal"
  ]
};

/**
 * xmlkv command
 *
 * Category: fields::add
 * Description: Finds key value pairs of the form <foo>bar</foo> where foo is the key and bar is the value from the _raw key.
 */
export const xmlkvCommand: CommandSyntax = {
  "command": "xmlkv",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "xmlkv"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "creates"
      }
    ]
  },
  "category": "fields::add",
  "description": "Finds key value pairs of the form <foo>bar</foo> where foo is the key and bar is the value from the _raw key.",
  "related": [
    "extract",
    "kvform",
    "multikv",
    "rex",
    "xpath"
  ],
  "tags": [
    "extract",
    "xml"
  ]
};

/**
 * xmlunescape command
 *
 * Category: formatting
 * Description: Un-escapes XML entity references (for: &, <, and >) back to their corresponding characters (e.g., "&amp;" -> "&").
 */
export const xmlunescapeCommand: CommandSyntax = {
  "command": "xmlunescape",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "xmlunescape"
      },
      {
        "kind": "param",
        "type": "field"
      }
    ]
  },
  "category": "formatting",
  "description": "Un-escapes XML entity references (for: &, <, and >) back to their corresponding characters (e.g., \"&amp;\" -> \"&\").",
  "related": [],
  "tags": [
    "unescape",
    "xml",
    "escape"
  ]
};

/**
 * xpath command
 *
 * Category: fields::add
 * Description: Sets the value of OUTFIELD to the value of the XPATH applied to FIELD.  If no value could be set, the DEFAULT value is set.  FIELD defaults to "_raw"; OUTFIELD, to "xpath"; and DEFAULT, to not setting a default value.  The field value is wrapped in a "<data>...</data>" tags so that the field value is a valid xml, even if it contains some none xml.
 */
export const xpathCommand: CommandSyntax = {
  "command": "xpath",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "xpath"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "creates"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "field",
          "effect": "creates"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "name": "outfield",
          "effect": "creates"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "default"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "fields::add",
  "description": "Sets the value of OUTFIELD to the value of the XPATH applied to FIELD.  If no value could be set, the DEFAULT value is set.  FIELD defaults to \"_raw\"; OUTFIELD, to \"xpath\"; and DEFAULT, to not setting a default value.  The field value is wrapped in a \"<data>...</data>\" tags so that the field value is a valid xml, even if it contains some none xml.",
  "related": [
    "extract",
    "kvform",
    "multikv",
    "rex",
    "xmlkv"
  ],
  "tags": [
    "xml",
    "extract"
  ]
};

/**
 * xyseries command
 *
 * Category: reporting
 * Description: Converts results into a format suitable for graphing.  If multiple  y-data-fields are specified, each column name is the the y-data-field name followed by the sep string (default is ": ") and then the value of the y-name-field it applies to. If the grouped option is set to true (false by default), then the input is assumed to be sorted by the value of the <x-field> and multi-file input is allowed.
 */
export const xyseriesCommand: CommandSyntax = {
  "command": "xyseries",
  "syntax": {
    "kind": "sequence",
    "patterns": [
      {
        "kind": "literal",
        "value": "xyseries"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "bool",
          "name": "grouped"
        },
        "quantifier": "?"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      },
      {
        "kind": "param",
        "type": "field",
        "effect": "consumes"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "field",
          "effect": "consumes"
        },
        "quantifier": "+"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "sep"
        },
        "quantifier": "?"
      },
      {
        "kind": "group",
        "pattern": {
          "kind": "param",
          "type": "string",
          "name": "format"
        },
        "quantifier": "?"
      }
    ]
  },
  "category": "reporting",
  "description": "Converts results into a format suitable for graphing.  If multiple  y-data-fields are specified, each column name is the the y-data-field name followed by the sep string (default is \": \") and then the value of the y-name-field it applies to. If the grouped option is set to true (false by default), then the input is assumed to be sorted by the value of the <x-field> and multi-file input is allowed.",
  "related": [
    "untable"
  ],
  "tags": [
    "convert",
    "graph"
  ]
};

/**
 * Pattern Registry
 */
export const COMMAND_PATTERNS: Record<string, CommandSyntax> = {
  abstract: abstractCommand,
  accum: accumCommand,
  addcoltotals: addcoltotalsCommand,
  addinfo: addinfoCommand,
  addtotals: addtotalsCommand,
  analyzefields: analyzefieldsCommand,
  anomalies: anomaliesCommand,
  anomalousvalue: anomalousvalueCommand,
  anomalydetection: anomalydetectionCommand,
  append: appendCommand,
  appendcols: appendcolsCommand,
  arules: arulesCommand,
  associate: associateCommand,
  audit: auditCommand,
  autoregress: autoregressCommand,
  bin: binCommand,
  bucketdir: bucketdirCommand,
  chart: chartCommand,
  cluster: clusterCommand,
  cofilter: cofilterCommand,
  collapse: collapseCommand,
  collect: collectCommand,
  concurrency: concurrencyCommand,
  contingency: contingencyCommand,
  convert: convertCommand,
  copyresults: copyresultsCommand,
  correlate: correlateCommand,
  createrss: createrssCommand,
  datamodel: datamodelCommand,
  dbinspect: dbinspectCommand,
  debug: debugCommand,
  dedup: dedupCommand,
  delete: deleteCommand,
  delta: deltaCommand,
  diff: diffCommand,
  dump: dumpCommand,
  erex: erexCommand,
  eventcount: eventcountCommand,
  eventstats: eventstatsCommand,
  extract: extractCommand,
  fields: fieldsCommand,
  fieldsummary: fieldsummaryCommand,
  file: fileCommand,
  filldown: filldownCommand,
  fillnull: fillnullCommand,
  findkeywords: findkeywordsCommand,
  findtypes: findtypesCommand,
  folderize: folderizeCommand,
  foreach: foreachCommand,
  gauge: gaugeCommand,
  gentimes: gentimesCommand,
  geom: geomCommand,
  geomfilter: geomfilterCommand,
  geostats: geostatsCommand,
  head: headCommand,
  highlight: highlightCommand,
  history: historyCommand,
  iconify: iconifyCommand,
  inputcsv: inputcsvCommand,
  inputlookup: inputlookupCommand,
  internalinputcsv: internalinputcsvCommand,
  iplocation: iplocationCommand,
  join: joinCommand,
  kmeans: kmeansCommand,
  kvform: kvformCommand,
  loadjob: loadjobCommand,
  localize: localizeCommand,
  localop: localopCommand,
  lookup: lookupCommand,
  makecontinuous: makecontinuousCommand,
  makejson: makejsonCommand,
  makemv: makemvCommand,
  makeresults: makeresultsCommand,
  map: mapCommand,
  mcatalog: mcatalogCommand,
  mcollect: mcollectCommand,
  metadata: metadataCommand,
  metasearch: metasearchCommand,
  meventcollect: meventcollectCommand,
  mstats: mstatsCommand,
  multikv: multikvCommand,
  mvcombine: mvcombineCommand,
  mvexpand: mvexpandCommand,
  newseriesfilter: newseriesfilterCommand,
  nokv: nokvCommand,
  nomv: nomvCommand,
  outlier: outlierCommand,
  outputcsv: outputcsvCommand,
  outputraw: outputrawCommand,
  outputrawr: outputrawrCommand,
  outputtelemetry: outputtelemetryCommand,
  outputtext: outputtextCommand,
  overlap: overlapCommand,
  pivot: pivotCommand,
  predict: predictCommand,
  preview: previewCommand,
  rare: rareCommand,
  rawstats: rawstatsCommand,
  redistribute: redistributeCommand,
  regex: regexCommand,
  relevancy: relevancyCommand,
  reltime: reltimeCommand,
  rename: renameCommand,
  replace: replaceCommand,
  reverse: reverseCommand,
  rtorder: rtorderCommand,
  runshellscript: runshellscriptCommand,
  savedsearch: savedsearchCommand,
  script: scriptCommand,
  scrub: scrubCommand,
  search: searchCommand,
  searchtxn: searchtxnCommand,
  select: selectCommand,
  selfjoin: selfjoinCommand,
  sendemail: sendemailCommand,
  set: setCommand,
  shape: shapeCommand,
  showargs: showargsCommand,
  sichart: sichartCommand,
  sirare: sirareCommand,
  sistats: sistatsCommand,
  sitimechart: sitimechartCommand,
  sitop: sitopCommand,
  sort: sortCommand,
  spath: spathCommand,
  stats: statsCommand,
  strcat: strcatCommand,
  streamedcsv: streamedcsvCommand,
  surrounding: surroundingCommand,
  table: tableCommand,
  tagcreate: tagcreateCommand,
  tagdelete: tagdeleteCommand,
  tags: tagsCommand,
  tagset: tagsetCommand,
  tail: tailCommand,
  timechart: timechartCommand,
  top: topCommand,
  transaction: transactionCommand,
  transpose: transposeCommand,
  trendline: trendlineCommand,
  tscollect: tscollectCommand,
  tstats: tstatsCommand,
  typeahead: typeaheadCommand,
  typelearner: typelearnerCommand,
  typer: typerCommand,
  union: unionCommand,
  uniq: uniqCommand,
  untable: untableCommand,
  where: whereCommand,
  x11: x11Command,
  xmlkv: xmlkvCommand,
  xmlunescape: xmlunescapeCommand,
  xpath: xpathCommand,
  xyseries: xyseriesCommand
};
