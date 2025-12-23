# Security Policy

## Vulnerability Scanning

This project uses automated vulnerability scanning to identify and address security issues in both dependencies and code.

### Running Security Scans

```bash
# Quick security check (recommended before commits)
npm run security:check

# Full scan with JSON reports
npm run security:scan

# View summary of findings
npm run security:report

# Fix auto-fixable issues
npm run security:audit:fix      # Fix dependency vulnerabilities
npm run security:sast:fix        # Fix code security issues
```

### Scan Types

#### 1. Dependency Vulnerability Scanning
- **Tool**: npm audit
- **What it checks**: Known CVEs in npm packages
- **Reports**: `security-reports/npm-audit.json`

#### 2. Static Application Security Testing (SAST)
- **Tools**: ESLint with security plugins
  - `eslint-plugin-security` - General security patterns
  - `@microsoft/eslint-plugin-sdl` - Microsoft Security Development Lifecycle
- **What it checks**:
  - Unsafe regular expressions
  - eval() usage
  - innerHTML vulnerabilities
  - Object injection
  - Insecure URLs
  - And more...
- **Reports**: `security-reports/sast-report.json`

## Severity Classification

### Critical
**Action**: Fix immediately before deployment

Examples:
- Remote Code Execution (RCE)
- SQL Injection in production code
- XSS in production dependencies
- Authentication bypass

### High
**Action**: Fix before deployment

Examples:
- Prototype pollution in runtime code
- Path traversal vulnerabilities
- Insecure cryptography
- Sensitive data exposure

### Moderate
**Action**: Fix in next sprint

Examples:
- Vulnerabilities in dev dependencies only
- Exploitable only under specific conditions
- DoS vulnerabilities
- Information disclosure

### Low
**Action**: Monitor and plan fixes

Examples:
- Vulnerabilities in transitive dependencies
- Theoretical vulnerabilities with no known exploits
- Minor information leaks

## Vulnerability Triage Workflow

### Step 1: Run Security Scan
```bash
npm run security:scan
npm run security:report
```

### Step 2: Review Findings
- Check if vulnerability affects production code
- Verify if the vulnerable code path is actually used
- Check for available patches or updates
- Assess actual risk to the application

### Step 3: Document Decisions

For each vulnerability, document your decision:

#### Accept Risk (Temporary)
If you determine a vulnerability is low risk or not exploitable in your context:

1. Document in this file under "Accepted Risks" below
2. Set a review date
3. Explain the reasoning

#### Fix Immediately
For high/critical issues:

1. Apply automatic fixes: `npm run security:audit:fix`
2. Or update manually: `npm update <package>`
3. For breaking changes: `npm audit fix --force` (test thoroughly!)
4. Verify fix: `npm run security:scan`

#### Suppress False Positives
For SAST false positives:

```typescript
// Inline suppression with justification
// eslint-disable-next-line security/detect-object-injection
const value = obj[validatedKey]; // Key is validated against allowlist

// Block suppression
/* eslint-disable security/detect-non-literal-regexp
   Regex pattern is from validated configuration, not user input */
const regex = new RegExp(configPattern);
/* eslint-enable security/detect-non-literal-regexp */
```

## Accepted Risks

### esbuild - GHSA-67mh-4wv8-2f99
- **Version**: <=0.24.2 (transitive via vitest → vite-node → vite → esbuild)
- **Severity**: Moderate (npm audit classification)
- **Actual Risk**: Low
- **Status**: Accepted Risk
- **Reason**:
  - Development-time vulnerability only (not exploitable in production)
  - Updating to latest version causes breaking changes in test infrastructure
  - Vulnerability requires attacker to access local development server
  - Does not affect production builds or runtime
- **Mitigation**:
  - Development servers should only run on localhost
  - Do not expose development server to untrusted networks
  - Production builds use separate build process (Vite build)
- **Documented**: 2025-12-23
- **Review Date**: 2026-03-23 (3 months)
- **Reviewer**: Development Team

### Template for Future Entries
```markdown
### [Package Name] - [CVE/Issue ID]
- **Version**: x.x.x
- **Severity**: Low/Moderate/High
- **Status**: Accepted Risk
- **Reason**: [Why this is acceptable]
- **Mitigation**: [Any mitigations in place]
- **Documented**: YYYY-MM-DD
- **Review Date**: YYYY-MM-DD
- **Reviewer**: [Name]
```

---

## Known Vulnerability Targets

Based on the project dependencies, pay special attention to:

### High Priority Monitoring
1. **prismjs** (v1.30.0)
   - History of XSS vulnerabilities
   - Used for: Syntax highlighting
   - Risk: User-controlled input could be highlighted
   - Mitigation: Sanitize all input before highlighting

2. **vis-network/vis-data** (v10.0.2 / v8.0.3)
   - DOM manipulation libraries
   - Used for: Graph visualization
   - Risk: Potential XSS if rendering untrusted data
   - Mitigation: Validate and sanitize all graph data

3. **react-dom** (v19.2.0)
   - Keep updated for security patches
   - Used for: Core React rendering
   - Risk: Framework vulnerabilities affect entire app
   - Mitigation: Stay on latest stable version

4. **chevrotain** (v11.0.3)
   - Parser library
   - Used for: SPL parsing
   - Risk: ReDoS (Regular expression Denial of Service)
   - Mitigation: Timeout long-running parsing operations

## Security Best Practices

### Code Review Checklist
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] All user input is validated and sanitized
- [ ] No hardcoded secrets or credentials
- [ ] External URLs use HTTPS
- [ ] RegEx patterns are tested for ReDoS
- [ ] File paths are validated to prevent traversal
- [ ] API endpoints have proper authentication
- [ ] CORS is properly configured

### Development Guidelines
1. **Never commit secrets**: Use environment variables
2. **Validate all input**: Don't trust any external data
3. **Use parameterized queries**: Prevent injection attacks
4. **Keep dependencies updated**: Run `npm outdated` regularly
5. **Review security warnings**: Don't ignore ESLint security rules
6. **Test security fixes**: Ensure fixes don't break functionality

## Reporting Security Issues

If you discover a security vulnerability in this project:

1. **Do not** open a public issue
2. Email the maintainers directly (add contact info)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Scan Schedule

- **Daily**: During development (via `npm run security:check`)
- **Pre-commit**: Automated via git hooks (optional)
- **Weekly**: Full scan in CI/CD (if configured)
- **Before release**: Complete security audit

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [npm Security Best Practices](https://docs.npmjs.com/packages-and-modules/securing-your-code)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- [Microsoft Security Development Lifecycle](https://www.microsoft.com/en-us/securityengineering/sdl/)

---

*Last Updated: 2025-12-23*
