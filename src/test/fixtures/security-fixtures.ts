/**
 * Security-focused test fixtures for adversarial testing.
 * Contains malicious inputs for XSS, injection, and other security tests.
 */

/**
 * XSS (Cross-Site Scripting) test vectors
 */
export const xssVectors = {
  // Basic script injection
  scriptTag: '<script>alert("xss")</script>',
  scriptTagUppercase: '<SCRIPT>alert("XSS")</SCRIPT>',

  // Event handler injection
  imgOnError: '<img src=x onerror=alert(1)>',
  imgOnLoad: '<img src="javascript:alert(1)">',
  svgOnLoad: '<svg onload=alert(1)>',

  // JavaScript protocol
  javascriptProtocol: 'javascript:alert(document.cookie)',
  dataProtocol: 'data:text/html,<script>alert(1)</script>',

  // HTML entities
  encodedScript: '&lt;script&gt;alert(1)&lt;/script&gt;',
  doubleEncoded: '&amp;lt;script&amp;gt;alert(1)&amp;lt;/script&amp;gt;',

  // Attribute injection
  attributeBreakout: '" onload="alert(1)"',
  eventHandlerAttr: 'onload=alert(1) x="',

  // SVG-based XSS
  svgScript: '<svg><script>alert(1)</script></svg>',
  svgAnimate: '<svg><animate onbegin=alert(1) attributeName=x dur=1s>',

  // Embedded objects
  embedSrc: '<embed src="javascript:alert(1)">',
  objectData: '<object data="javascript:alert(1)">',

  // Style-based XSS
  styleExpression: '<div style="background:url(javascript:alert(1))">',
  importStyle: '<style>@import "javascript:alert(1)";</style>',
};

/**
 * SQL Injection test vectors
 */
export const sqlInjectionVectors = {
  // Classic SQL injection
  orTrue: "' OR '1'='1",
  orTrueDash: "' OR '1'='1' --",
  dropTable: "'; DROP TABLE users--",
  unionSelect: "' UNION SELECT * FROM users--",

  // Comment-based
  dashDash: "admin'--",
  hashComment: "admin'#",
  slashStar: "admin'/*",

  // Stacked queries
  stackedQueries: "'; DELETE FROM users WHERE '1'='1",

  // Tautology
  tautology: "1' OR '1' = '1",
  alwaysTrue: "' OR 1=1--",
};

/**
 * Command Injection test vectors
 */
export const commandInjectionVectors = {
  // Shell command injection
  pipeRm: '| rm -rf /',
  semicolonRm: '; rm -rf /',
  andCat: '&& cat /etc/passwd',
  orWhoami: '|| whoami',

  // Command substitution
  backticks: '`whoami`',
  dollarParen: '$(whoami)',

  // Windows commands
  windowsPipe: '| del /f /s /q C:\\*',
  windowsAnd: '& dir C:\\',
};

/**
 * Path Traversal test vectors
 */
export const pathTraversalVectors = {
  // Unix path traversal
  unixEtcPasswd: '../../etc/passwd',
  unixRoot: '../../../../../../../etc/passwd',

  // Windows path traversal
  windowsSystem32: '..\\..\\windows\\system32\\config\\sam',
  windowsBackslash: '..\\..\\..\\..\\windows\\win.ini',

  // URL-encoded
  urlEncoded: '%2e%2e%2f%2e%2e%2f%2e%2e%2f',
  doubleEncoded: '%252e%252e%252f',

  // Null byte injection
  nullByte: '../../etc/passwd\0',
};

/**
 * LDAP Injection test vectors
 */
export const ldapInjectionVectors = {
  adminBypass: '*)(uid=*))(&(uid=*',
  orQuery: '*)(objectClass=*',
  wildcardSearch: '*',
};

/**
 * ReDoS (Regular Expression Denial of Service) test vectors
 */
export const redosVectors = {
  // Nested quantifiers
  nestedPlus: '(a+)+b',
  nestedStar: '(a*)*b',
  nestedQuestion: '(a?)?b',

  // Overlapping alternation
  overlapping: '(a|a)*b',
  complexOverlap: '(a|ab)*c',

  // Catastrophic backtracking
  catastrophic: '(a+)+$',
  emailRegex: '^([a-zA-Z0-9])(([-.]|[_]+)?([a-zA-Z0-9]+))*@',

  // Test inputs (long strings that trigger ReDoS)
  longInputForNestedPlus: 'a'.repeat(50),
  longInputNoMatch: 'a'.repeat(50) + 'c',
};

/**
 * Unicode and encoding attack vectors
 */
export const unicodeVectors = {
  // Zero-width characters
  zeroWidth: 'admin\u200B\u200C\u200D',
  zeroWidthJoiner: 'field\u200Dname',

  // Right-to-left override
  rtlOverride: 'admin\u202Eroot',
  rtlEmbedding: '\u202Badmin\u202C',

  // Homograph attacks (look-alike characters)
  cyrillicA: 'аdmin', // а is Cyrillic
  greekO: 'admin', // ο is Greek omicron

  // Emoji
  emoji: 'user_😀_name',
  emojiZwj: '👨‍👩‍👧‍👦',

  // Surrogate pairs
  surrogatePair: '\uD800\uDC00',
  invalidSurrogate: '\uD800',

  // Combining characters
  combining: 'e\u0301', // e with acute accent
  multipleCombining: 'a\u0300\u0301\u0302',

  // Null bytes
  nullByte: 'field\x00name',
  nullInMiddle: 'user\0admin',

  // Control characters
  controlChars: 'field\x01\x02\x03name',
  tabNewline: 'field\t\nname',
};

/**
 * Large payload test vectors for performance/DoS testing
 */
export const largePayloadVectors = {
  // Very long strings
  longString: 'a'.repeat(10000),
  veryLongString: 'x'.repeat(100000),

  // Deeply nested structures
  deeplyNestedJson: (() => {
    let obj: any = { value: 'end' };
    for (let i = 0; i < 100; i++) {
      obj = { nested: obj };
    }
    return JSON.stringify(obj);
  })(),

  // Many repeated patterns
  repeatedPattern: '(nested)'.repeat(1000),

  // Large arrays
  largeArray: Array(1000).fill({ id: 'item', name: 'test' }),
};

/**
 * Special character combinations
 */
export const specialCharVectors = {
  // Mixed special characters
  allSpecial: '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`',
  quotes: `'""\``,
  backslashes: '\\\\\\\\',

  // Whitespace variations
  variousSpaces: 'field\u0020\u00A0\u2000\u2001name',
  tabs: 'field\t\t\tname',
  newlines: 'field\n\r\n\rname',

  // Percentage encoding
  percentEncoded: 'field%20name%3D',
  doublePercent: 'field%%name',
};

/**
 * Helper function to generate test cases with all XSS vectors
 */
export function generateXssTestCases(fieldName: string) {
  return Object.entries(xssVectors).map(([name, vector]) => ({
    testName: `prevents XSS: ${name}`,
    input: { [fieldName]: vector },
    vector,
  }));
}

/**
 * Helper function to generate test cases with all injection vectors
 */
export function generateInjectionTestCases(fieldName: string) {
  return [
    ...Object.entries(sqlInjectionVectors).map(([name, vector]) => ({
      testName: `prevents SQL injection: ${name}`,
      input: { [fieldName]: vector },
      vector,
    })),
    ...Object.entries(commandInjectionVectors).map(([name, vector]) => ({
      testName: `prevents command injection: ${name}`,
      input: { [fieldName]: vector },
      vector,
    })),
  ];
}
