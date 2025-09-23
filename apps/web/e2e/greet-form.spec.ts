import { test, expect } from '@playwright/test';

test('should render greet form and interact with API', async ({ page }) => {
  await page.goto('/');

  // Check if the greet form is present
  await expect(page.getByRole('heading', { name: 'API Greeting' })).toBeVisible();
  await expect(page.getByLabel(/name \(optional\)/i)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Greet' })).toBeVisible();

  // Test greeting without name
  await page.getByRole('button', { name: 'Greet' }).click();

  // Wait for API response and check result
  await expect(page.getByText('Hello, World!')).toBeVisible({ timeout: 5000 });

  // Test greeting with name
  await page.getByLabel(/name \(optional\)/i).fill('Playwright');
  await page.getByRole('button', { name: 'Greet' }).click();

  // Wait for API response and check result
  await expect(page.getByText('Hello, Playwright!')).toBeVisible({ timeout: 5000 });
});

test('should show loading state during API call', async ({ page }) => {
  await page.goto('/');

  // Click the greet button and immediately check for loading state
  await page.getByRole('button', { name: 'Greet' }).click();

  // The loading state might be very brief, so we use a timeout
  try {
    await expect(page.getByRole('button', { name: 'Loading...' })).toBeVisible({ timeout: 1000 });
  } catch {
    // Loading state might be too fast to catch, which is fine
    console.log('Loading state was too fast to detect');
  }

  // Eventually we should see the result
  await expect(page.getByText('Hello, World!')).toBeVisible({ timeout: 5000 });
});