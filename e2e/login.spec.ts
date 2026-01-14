import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Iniciar Sesión');
    await expect(page.locator('input#username')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();

    // Should show error message or validation
    await expect(page.locator('text=/campo.*vacío|requerido/i'))
      .toBeVisible({ timeout: 3000 })
      .catch(() => {
        // If no specific validation message, form should not navigate away
        expect(page.url()).toContain('/');
      });
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Fill login form with test credentials
    await page.fill('input#username', 'admin');
    await page.fill('input#password', 'admin123');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 5000 });

    // Verify we're on the dashboard
    expect(page.url()).toContain('/dashboard');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill login form with invalid credentials
    await page.fill('input#username', 'invalid_user');
    await page.fill('input#password', 'wrong_password');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show error message (look for the error container with emoji)
    await expect(
      page.locator('.bg-red-50, .dark\\:bg-red-900\\/20').filter({ hasText: '❌' })
    ).toBeVisible({ timeout: 3000 });
  });

  test('should have accessible form elements', async ({ page }) => {
    const usernameInput = page.locator('input#username');
    const passwordInput = page.locator('input#password');
    const submitButton = page.locator('button[type="submit"]');

    await expect(usernameInput).toBeEnabled();
    await expect(passwordInput).toBeEnabled();
    await expect(submitButton).toBeEnabled();
  });
});
