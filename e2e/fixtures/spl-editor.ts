/**
 * E2E Test Fixtures for SPL Editor
 *
 * Shared helper functions for interacting with the SPL editor in e2e tests.
 *
 * @module e2e/fixtures/spl-editor
 */

import type { Page, Locator } from '@playwright/test';

/**
 * Navigate to the splinter page and wait for it to load.
 */
export async function gotoSplinter(page: Page): Promise<void> {
  // Server is configured with base URL /coresplorer/
  await page.goto('/coresplorer/splinter');
  // Wait for editor to be ready using data-testid (more reliable than role)
  const editor = page.locator('[data-testid="spl-editor"]');
  await editor.waitFor({ state: 'visible', timeout: 15000 });
}

/**
 * Enter SPL code into the editor and wait for analysis to complete.
 *
 * @param page - Playwright page object
 * @param spl - SPL query to enter
 */
export async function enterSPL(page: Page, spl: string): Promise<void> {
  const editor = page.locator('[data-testid="spl-editor"]');
  await editor.fill(spl);
  // Wait for debounced analysis (120ms debounce + processing)
  await page.waitForTimeout(250);
}

/**
 * Get the position of a field in the editor text.
 * Returns the character offset from the start of the text.
 *
 * @param text - The full SPL text
 * @param fieldName - Name of the field to find
 * @returns Character offset, or -1 if not found
 */
function getFieldPosition(text: string, fieldName: string): number {
  // Look for the field as a whole word
  const regex = new RegExp(`\\b${fieldName}\\b`);
  const match = text.match(regex);
  return match?.index ?? -1;
}

/**
 * Get coordinates for hovering/clicking on a field in the editor.
 * Uses the editor's layout configuration to calculate pixel position.
 *
 * @param page - Playwright page object
 * @param fieldName - Name of the field to find
 * @returns Coordinates { x, y } for the field position
 */
async function getFieldCoordinates(page: Page, fieldName: string): Promise<{ x: number; y: number }> {
  const editor = page.locator('[data-testid="spl-editor"]');
  const box = await editor.boundingBox();
  if (!box) throw new Error('Editor not found');

  // Get the editor text
  const text = await editor.inputValue();
  const pos = getFieldPosition(text, fieldName);
  if (pos === -1) throw new Error(`Field "${fieldName}" not found in editor text`);

  // Calculate line and column
  const textBefore = text.slice(0, pos);
  const lines = textBefore.split('\n');
  const lineNumber = lines.length;
  const column = lines[lines.length - 1].length;

  // Use the editor layout config values (matching editorLayout in the app)
  const lineHeight = 21; // editorLayout.LINE_HEIGHT_PX
  const charWidth = 7.7; // editorLayout.CHAR_WIDTH_PX
  const paddingY = 16; // editorLayout.PADDING_Y_PX
  const leftPadding = 32; // editorLayout.TOTAL_LEFT_PADDING_PX (GUTTER_WIDTH_PX + PADDING_X_PX)

  // Calculate pixel position - start of the field name (more reliable)
  const x = box.x + leftPadding + (column + 0.5) * charWidth;
  const y = box.y + paddingY + (lineNumber - 0.5) * lineHeight;

  return { x, y };
}

/**
 * Hover over a field token to trigger the lineage tooltip.
 *
 * @param page - Playwright page object
 * @param fieldName - Name of the field to hover
 */
export async function hoverField(page: Page, fieldName: string): Promise<void> {
  const { x, y } = await getFieldCoordinates(page, fieldName);
  await page.mouse.move(x, y);
  // Small delay for tooltip to appear
  await page.waitForTimeout(200);
}

/**
 * Click on a field token to trigger highlighting.
 *
 * @param page - Playwright page object
 * @param fieldName - Name of the field to click
 */
export async function clickField(page: Page, fieldName: string): Promise<void> {
  const { x, y } = await getFieldCoordinates(page, fieldName);
  await page.mouse.click(x, y);
}

/**
 * Get the lineage tooltip element.
 */
export function getLineageTooltip(page: Page): Locator {
  return page.locator('[data-testid="lineage-tooltip"]');
}

/**
 * Get the highlight legend element.
 */
export function getHighlightLegend(page: Page): Locator {
  return page.locator('[data-testid="highlight-legend"]');
}

/**
 * Get the stats panel element.
 */
export function getStatsPanel(page: Page): Locator {
  return page.locator('[data-testid="stats-panel"]');
}

/**
 * Get a field badge from the stats panel.
 *
 * @param page - Playwright page object
 * @param fieldName - Name of the field to find
 */
export function getFieldBadge(page: Page, fieldName: string): Locator {
  return getStatsPanel(page).locator(`text=${fieldName}`);
}

/**
 * Clear the current field selection by clicking the clear button in the legend.
 */
export async function clearSelection(page: Page): Promise<void> {
  const legend = getHighlightLegend(page);
  const clearButton = legend.locator('button[title="Clear selection"]');
  await clearButton.click();
}

/**
 * Toggle the lock on the current field selection.
 */
export async function toggleLock(page: Page): Promise<void> {
  const legend = getHighlightLegend(page);
  const lockButton = legend.locator('button').filter({ hasText: '' }).first();
  await lockButton.click();
}
