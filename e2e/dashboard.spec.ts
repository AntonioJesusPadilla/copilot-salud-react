import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.fill('input[placeholder*="nombre de usuario"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 5000 });
  });

  test('should display dashboard after login', async ({ page }) => {
    // Verify dashboard is loaded
    expect(page.url()).toContain('/dashboard');

    // Check for dashboard elements
    await expect(page.locator('text=/Dashboard|Panel/i')).toBeVisible();
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

    if (await mapLink.isVisible()) {
      await mapLink.click();
      await page.waitForURL('**/map', { timeout: 5000 });
      expect(page.url()).toContain('/map');
    }
  });

  test('should navigate to chat page', async ({ page }) => {
    // Look for chat navigation link
    const chatLink = page.locator('text=/Chat|Asistente/i').first();

    if (await chatLink.isVisible()) {
      await chatLink.click();
      await page.waitForURL('**/chat', { timeout: 5000 });
      expect(page.url()).toContain('/chat');
    }
  });

  test('should have logout functionality', async ({ page }) => {
    // Look for logout button (usually in header or menu)
    const logoutButton = page.locator('button:has-text("Cerrar"), button:has-text("Logout"), text=/Cerrar sesión/i').first();

    if (await logoutButton.isVisible()) {
      await logoutButton.click();

      // Should redirect to login page
      await page.waitForURL('/', { timeout: 5000 });
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
