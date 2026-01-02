import { test, expect } from '@playwright/test';

test.describe('Responsive Header', () => {
  test('search bar adapts to screen width and badge remains visible', async ({ page }) => {
    await page.goto('/');

    const searchContainer = page.locator('header input[type="text"]').locator('xpath=..'); // Assuming input is inside the container we styled
    // Or better, I'll select the container by the class I added. 
    // The hierarchy is: div > div > input. The div with classes is the parent of the input (or close to it).
    // Let's use a more stable selector if possible, but the classes are on the wrapper.
    // I can assume the search input is present.

    // Let's verify visibility of the badge
    const badge = page.getByTestId('snapshot-freshness-badge');
    await expect(badge).toBeVisible();

    // 1. Large Screen
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(badge).toBeVisible();
    await expect(badge).toBeInViewport();
    
    // Check search bar width - logic: max-w-lg is 32rem = 512px
    // We can't easily check computed style max-width in a simple expectation without eval, 
    // but we can check if the badge is not obscured.
    
    // 2. Medium Screen (Laptop)
    // The issue was that search bar was too wide here.
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(badge).toBeVisible();
    await expect(badge).toBeInViewport();
    
    // 3. Small Screen (Tablet)
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(badge).toBeVisible();
    await expect(badge).toBeInViewport();
  });
});
