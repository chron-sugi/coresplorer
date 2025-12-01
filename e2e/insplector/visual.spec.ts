import { test, expect } from '@playwright/test';

test.describe('splinter Visual Regression', () => {
  test('Lineage underlining renders correctly', async ({ page }) => {
    // Navigate to the app
    await page.goto('/splinter');
    
    // Enter SPL code that triggers lineage (fields)
    const editor = page.getByRole('textbox', { name: /SPL Analysis Editor/i });
    await editor.fill('search index=main | stats count by host');

    // Wait for the code block to be visible and processed
    // We look for the token 'host' which should be highlighted/underlined
    const codeBlock = page.locator('pre.line-numbers'); 
    await expect(codeBlock).toBeVisible();

    // Click on 'host' to trigger active field state if needed, 
    // or just verify the initial render.
    // For visual regression, we just want to see the screen.
    
    // Take a screenshot of the editor panel
    // We scope it to the editor panel to avoid noise from timestamps/badges
    const editorPanel = page.locator('.relative.h-full.rounded-md.overflow-hidden');
    await expect(editorPanel).toBeVisible();
    
    // Note: First run will fail and generate the baseline.
    await expect(editorPanel).toHaveScreenshot('lineage-baseline.png');
  });
});
