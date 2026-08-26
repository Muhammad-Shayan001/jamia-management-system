import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/en/login');
  await expect(page).toHaveTitle(/Jamia LMS/);
});

test('login requires credentials', async ({ page }) => {
  await page.goto('/en/login');
  
  // Try clicking submit without filling
  await page.click('button[type="submit"]');
  
  // HTML5 validation should prevent submission, or the server will return an error
  // Just checking the form remains
  await expect(page.locator('form')).toBeVisible();
});
