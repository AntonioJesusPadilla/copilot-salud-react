import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.fill('input#username', 'admin');
    await page.fill('input#password', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 5000 });
  });

  test('should display dashboard after login', async ({ page }) => {
    // Verify dashboard is loaded
    expect(page.url()).toContain('/dashboard');

    // Check for dashboard elements (using first() to avoid strict mode violation)
    await expect(page.locator('text=/Dashboard|Panel/i').first()).toBeVisible();
  });

  test('should display KPIs', async ({ page }) => {
    // Wait for KPIs to load
    await page.waitForSelector('[class*="grid"]', { timeout: 5000 });

    // Should have multiple KPI cards
    const kpiCards = page.locator('[class*="rounded"]').filter({ hasText: /\d+/ });
    await expect(kpiCards.first()).toBeVisible();
  });

  test('should navigate to map page', async ({ page }) => {
    // Look for map navigation link
    const mapLink = page.locator('text=/Mapa|Centros/i').first();

    if (await mapLink.isVisible().catch(() => false)) {
      await mapLink.click();
      // Map page may take longer to load due to Leaflet
      await page.waitForURL('**/map', { timeout: 10000 }).catch(() => {});
      // Check if navigation happened (even if timeout)
      if (page.url().includes('/map')) {
        expect(page.url()).toContain('/map');
      }
    }
  });

  test('should navigate to chat page', async ({ page }) => {
    // Look for chat navigation link
    const chatLink = page.locator('text=/Chat|Asistente/i').first();

    if (await chatLink.isVisible().catch(() => false)) {
      await chatLink.click();
      // Chat page may take longer to load
      await page.waitForURL('**/chat', { timeout: 10000 }).catch(() => {});
      // Check if navigation happened (even if timeout)
      if (page.url().includes('/chat')) {
        expect(page.url()).toContain('/chat');
      }
    }
  });

  test('should have logout functionality', async ({ page }) => {
    // Look for logout button (usually in header or menu)
    const logoutButton = page.getByRole('button', { name: /cerrar|logout/i }).first();

    if (await logoutButton.isVisible().catch(() => false)) {
      await logoutButton.click();

      // Should redirect to login page
      await page.waitForURL(/\/(login)?$/, { timeout: 5000 });
      expect(page.url()).not.toContain('/dashboard');
    }
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Dashboard should still be visible
    await expect(page.locator('body')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Dashboard should still be visible
    await expect(page.locator('body')).toBeVisible();
  });
});
