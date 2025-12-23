import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface NpmAuditMetadata {
  vulnerabilities: {
    info?: number;
    low?: number;
    moderate?: number;
    high?: number;
    critical?: number;
  };
  dependencies?: number;
  devDependencies?: number;
  optionalDependencies?: number;
  totalDependencies?: number;
}

interface NpmAuditReport {
  auditReportVersion?: number;
  vulnerabilities?: Record<string, unknown>;
  metadata?: NpmAuditMetadata;
}

interface ESLintMessage {
  ruleId?: string;
  severity: number;
  message: string;
  line?: number;
  column?: number;
}

interface ESLintResult {
  filePath: string;
  messages: ESLintMessage[];
  errorCount: number;
  warningCount: number;
  fixableErrorCount?: number;
  fixableWarningCount?: number;
}

const reportDir = join(process.cwd(), 'security-reports');

function formatNumber(num: number | undefined): string {
  return num?.toString() || '0';
}

function displayHeader(title: string): void {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${'='.repeat(60)}\n`);
}

function displaySection(title: string): void {
  console.log(`\n${title}:`);
  console.log(`${'-'.repeat(40)}`);
}

try {
  let hasIssues = false;

  // Read npm audit report
  const npmAuditPath = join(reportDir, 'npm-audit.json');
  if (existsSync(npmAuditPath)) {
    displayHeader('SECURITY SCAN SUMMARY');

    const npmAuditData = readFileSync(npmAuditPath, 'utf-8');
    const npmAudit: NpmAuditReport = JSON.parse(npmAuditData);

    const vulns = npmAudit.metadata?.vulnerabilities || {};
    const critical = vulns.critical || 0;
    const high = vulns.high || 0;
    const moderate = vulns.moderate || 0;
    const low = vulns.low || 0;
    const info = vulns.info || 0;
    const total = critical + high + moderate + low + info;

    displaySection('Dependency Vulnerabilities');
    console.log(`  Total Vulnerabilities: ${total}`);
    if (critical > 0) {
      console.log(`  🔴 Critical: ${formatNumber(critical)}`);
      hasIssues = true;
    }
    if (high > 0) {
      console.log(`  🟠 High:     ${formatNumber(high)}`);
      hasIssues = true;
    }
    if (moderate > 0) {
      console.log(`  🟡 Moderate: ${formatNumber(moderate)}`);
      hasIssues = true;
    }
    if (low > 0) {
      console.log(`  🔵 Low:      ${formatNumber(low)}`);
    }
    if (info > 0) {
      console.log(`  ⚪ Info:     ${formatNumber(info)}`);
    }

    if (total === 0) {
      console.log('  ✅ No vulnerabilities found!');
    }
  } else {
    console.log('⚠️  npm audit report not found. Run: npm run security:audit:report');
  }

  // Read SAST report
  const sastPath = join(reportDir, 'sast-report.json');
  if (existsSync(sastPath)) {
    const sastData = readFileSync(sastPath, 'utf-8');
    const sastReport: ESLintResult[] = JSON.parse(sastData);

    const totalErrors = sastReport.reduce((sum, r) => sum + r.errorCount, 0);
    const totalWarnings = sastReport.reduce((sum, r) => sum + r.warningCount, 0);
    const filesWithIssues = sastReport.filter(r => r.errorCount > 0 || r.warningCount > 0).length;

    displaySection('Static Application Security Testing (SAST)');
    console.log(`  Files scanned: ${sastReport.length}`);
    console.log(`  Files with issues: ${filesWithIssues}`);

    if (totalErrors > 0) {
      console.log(`  🔴 Errors:   ${totalErrors}`);
      hasIssues = true;
    }
    if (totalWarnings > 0) {
      console.log(`  🟡 Warnings: ${totalWarnings}`);
    }

    if (totalErrors === 0 && totalWarnings === 0) {
      console.log('  ✅ No security issues found!');
    } else {
      // Show top security issues
      const securityIssues = sastReport
        .flatMap(r => r.messages.map(m => ({ ...m, filePath: r.filePath })))
        .filter(m => m.ruleId?.includes('security/') || m.ruleId?.includes('@microsoft/sdl/'))
        .slice(0, 10);

      if (securityIssues.length > 0) {
        displaySection('Top Security Issues');
        securityIssues.forEach((issue, idx) => {
          const severity = issue.severity === 2 ? '🔴 ERROR' : '🟡 WARN';
          const location = `${issue.filePath}:${issue.line}:${issue.column}`;
          console.log(`  ${idx + 1}. ${severity} [${issue.ruleId}]`);
          console.log(`     ${location}`);
          console.log(`     ${issue.message}\n`);
        });
      }
    }
  } else {
    console.log('⚠️  SAST report not found. Run: npm run security:sast');
  }

  // Next steps
  displaySection('Next Steps');

  if (hasIssues) {
    console.log('  1. Review the findings above');
    console.log('  2. For dependency vulnerabilities: npm run security:audit:fix');
    console.log('  3. For code issues: npm run security:sast:fix (auto-fix) or fix manually');
    console.log('  4. Check SECURITY.md for triage guidelines');
    console.log('  5. Re-run: npm run security:scan');
    console.log('\n  📊 Full reports available in: ./security-reports/');
  } else {
    console.log('  ✅ All security checks passed!');
    console.log('  💡 Run security:scan regularly to stay secure');
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Exit with error code if there are critical/high issues
  process.exit(hasIssues ? 1 : 0);

} catch (error) {
  console.error('❌ Error reading security reports:');
  if (error instanceof Error) {
    console.error(`   ${error.message}`);
  }
  console.error('\n💡 Make sure to run: npm run security:scan\n');
  process.exit(1);
}
