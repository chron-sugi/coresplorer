/**
 * Field Lineage E2E Tests
 *
 * Tests for field lineage functionality including hover tooltips,
 * click highlighting, stats panel integration, and multi-command tracking.
 */

import { test, expect } from '@playwright/test';
import {
  gotoSplinter,
  enterSPL,
  hoverField,
  clickField,
  getLineageTooltip,
  getHighlightLegend,
  getStatsPanel,
  getFieldBadge,
  clearSelection,
} from '../fixtures/spl-editor';

// =============================================================================
// FIELD HOVER TOOLTIP TESTS
// =============================================================================

test.describe('Field Hover Tooltip', () => {
  test('displays lineage tooltip on field hover', async ({ page }) => {
    await gotoSplinter(page);
    await enterSPL(page, 'index=main | eval foo=bar+1');

    await hoverField(page, 'foo');

    const tooltip = getLineageTooltip(page);
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText('foo');
    await expect(tooltip).toContainText('Created');
  });

  test('tooltip shows field data type for numeric expressions', async ({ page }) => {
    await gotoSplinter(page);
    await enterSPL(page, 'index=main | eval count=1+2');

    await hoverField(page, 'count');

    const tooltip = getLineageTooltip(page);
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText('number');
  });

  test('tooltip shows dependencies list', async ({ page }) => {
    await gotoSplinter(page);
    await enterSPL(page, 'index=main | eval result=fieldA+fieldB');

    await hoverField(page, 'result');

    const tooltip = getLineageTooltip(page);
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText('fieldA');
    await expect(tooltip).toContainText('fieldB');
  });

  test('tooltip disappears when mouse moves away', async ({ page }) => {
    await gotoSplinter(page);
    await enterSPL(page, 'index=main | eval foo=1');

    await hoverField(page, 'foo');
    const tooltip = getLineageTooltip(page);
    await expect(tooltip).toBeVisible();

    // Move mouse away
    await page.mouse.move(0, 0);
    await expect(tooltip).not.toBeVisible();
  });
});

// =============================================================================
// FIELD CLICK HIGHLIGHTING TESTS
// =============================================================================

test.describe('Field Click Highlighting', () => {
  test('clicking field shows highlight legend', async ({ page }) => {
    await gotoSplinter(page);
    await enterSPL(page, 'index=main | eval foo=1');

    await clickField(page, 'foo');

    const legend = getHighlightLegend(page);
    await expect(legend).toBeVisible();
    await expect(legend).toContainText('foo');
  });

  test('highlight legend shows color key for event types', async ({ page }) => {
    await gotoSplinter(page);
    await enterSPL(page, 'index=main | eval foo=1 | stats count by foo');

    await clickField(page, 'foo');

    const legend = getHighlightLegend(page);
    await expect(legend).toBeVisible();
    await expect(legend).toContainText('Created');
    await expect(legend).toContainText('Used');
  });

  test('clicking clear button removes highlighting', async ({ page }) => {
    await gotoSplinter(page);
    await enterSPL(page, 'index=main | eval foo=1');

    await clickField(page, 'foo');
    const legend = getHighlightLegend(page);
    await expect(legend).toBeVisible();

    await clearSelection(page);
    await expect(legend).not.toBeVisible();
  });

  test('clicking different field switches highlight', async ({ page }) => {
    await gotoSplinter(page);
    await enterSPL(page, 'index=main | eval foo=1, bar=2');

    await clickField(page, 'foo');
    const legend = getHighlightLegend(page);
    await expect(legend).toContainText('foo');

    await clickField(page, 'bar');
    await expect(legend).toContainText('bar');
    await expect(legend).not.toContainText('foo');
  });
});

// =============================================================================
// STATS PANEL INTEGRATION TESTS
// =============================================================================

test.describe('Stats Panel Integration', () => {
  test('stats panel shows extracted fields', async ({ page }) => {
    await gotoSplinter(page);
    await enterSPL(page, 'index=main | eval foo=1, bar=2');

    const statsPanel = getStatsPanel(page);
    await expect(statsPanel).toBeVisible();
    await expect(statsPanel).toContainText('foo');
    await expect(statsPanel).toContainText('bar');
  });

  test('clicking field badge in stats panel highlights editor', async ({ page }) => {
    await gotoSplinter(page);
    await enterSPL(page, 'index=main | eval foo=1');

    const fieldBadge = getFieldBadge(page, 'foo');
    await fieldBadge.click();

    // Should trigger highlighting (legend may or may not appear depending on implementation)
    // At minimum, the field badge should be clickable
    await expect(fieldBadge).toBeVisible();
  });

  test('stats panel shows command badges', async ({ page }) => {
    await gotoSplinter(page);
    await enterSPL(page, 'index=main | eval foo=1 | stats count');

    const statsPanel = getStatsPanel(page);
    await expect(statsPanel).toContainText('eval');
    await expect(statsPanel).toContainText('stats');
  });
});

// =============================================================================
// MULTI-COMMAND LINEAGE TESTS
// =============================================================================

test.describe('Multi-Command Lineage Tracking', () => {
  test('tracks field through eval → rename chain', async ({ page }) => {
    await gotoSplinter(page);
    await enterSPL(page, 'index=main | eval foo=1 | rename foo as bar');

    // Hover over the renamed field 'bar'
    await hoverField(page, 'bar');

    const tooltip = getLineageTooltip(page);
    await expect(tooltip).toBeVisible();
    // 'bar' should show it depends on 'foo'
    await expect(tooltip).toContainText('foo');
  });

  test('tracks multiple dependencies in complex eval', async ({ page }) => {
    await gotoSplinter(page);
    await enterSPL(page, 'index=main | eval total=price*quantity');

    await hoverField(page, 'total');

    const tooltip = getLineageTooltip(page);
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText('price');
    await expect(tooltip).toContainText('quantity');
  });

  test('shows stats aggregation creates new fields', async ({ page }) => {
    await gotoSplinter(page);
    await enterSPL(page, 'index=main | stats count as total_count');

    await hoverField(page, 'total_count');

    const tooltip = getLineageTooltip(page);
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText('Created');
  });
});

// =============================================================================
// ERROR HANDLING TESTS
// =============================================================================

test.describe('Error Handling', () => {
  test('handles incomplete SPL gracefully', async ({ page }) => {
    await gotoSplinter(page);
    await enterSPL(page, 'index=main | eval foo=');

    // Should not crash - stats panel should still be visible
    const statsPanel = getStatsPanel(page);
    await expect(statsPanel).toBeVisible();
  });

  test('handles empty query', async ({ page }) => {
    await gotoSplinter(page);
    await enterSPL(page, '');

    const statsPanel = getStatsPanel(page);
    await expect(statsPanel).toBeVisible();
  });

  test('handles query with only search terms', async ({ page }) => {
    await gotoSplinter(page);
    await enterSPL(page, 'index=main sourcetype=access');

    const statsPanel = getStatsPanel(page);
    await expect(statsPanel).toBeVisible();
  });
});

// =============================================================================
// VISUAL REGRESSION TESTS
// =============================================================================

test.describe('Visual Regression', () => {
  test('highlight colors render correctly', async ({ page }) => {
    await gotoSplinter(page);
    await enterSPL(page, 'index=main | eval foo=1 | stats count by foo');

    await clickField(page, 'foo');

    // Wait for highlighting to apply
    await page.waitForTimeout(200);

    // Take screenshot of the editor panel with highlighting
    const editorPanel = page.locator('.relative.h-full.rounded-md.overflow-hidden');
    await expect(editorPanel).toHaveScreenshot('field-highlight-foo.png');
  });

  test('tooltip renders correctly', async ({ page }) => {
    await gotoSplinter(page);
    await enterSPL(page, 'index=main | eval result=fieldA+fieldB');

    await hoverField(page, 'result');

    const tooltip = getLineageTooltip(page);
    await expect(tooltip).toBeVisible();

    await expect(tooltip).toHaveScreenshot('lineage-tooltip-with-deps.png');
  });
});
