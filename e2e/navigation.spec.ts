import { test, expect } from '@playwright/test';

test.describe('Navigation and Routing', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.fill('input[placeholder*="nombre de usuario"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 5000 });
  });

  test('should protect routes from unauthenticated access', async ({ page, context }) => {
    // Logout to clear authentication
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());

    // Try to access dashboard directly
    await page.goto('/dashboard');

    // Should redirect to login
    await page.waitForURL('/', { timeout: 5000 });
    expect(page.url()).not.toContain('/dashboard');
  });

  test('should navigate between pages', async ({ page }) => {
    // Start at dashboard
    expect(page.url()).toContain('/dashboard');

    // Try to navigate to different pages
    const pages = [
      { link: /Mapa|Centros/i, url: '/map' },
      { link: /Chat|Asistente/i, url: '/chat' },
    ];

    for (const pageInfo of pages) {
      const link = page.locator(`text=${pageInfo.link}`).first();

      if (await link.isVisible({ timeout: 2000 }).catch(() => false)) {
        await link.click();
        await page.waitForURL(`**${pageInfo.url}`, { timeout: 5000 });
        expect(page.url()).toContain(pageInfo.url);

        // Navigate back to dashboard
        const dashboardLink = page.locator('text=/Dashboard|Panel|Inicio/i').first();
        if (await dashboardLink.isVisible({ timeout: 2000 }).catch(() => false)) {
          await dashboardLink.click();
          await page.waitForURL('**/dashboard', { timeout: 5000 });
        } else {
          await page.goto('/dashboard');
        }
      }
    }
  });

  test('should maintain state across navigation', async ({ page }) => {
    // Check if we're still authenticated after navigation
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/dashboard');

    // Should not redirect to login
    await expect(page.locator('text=/Iniciar Sesión/i')).not.toBeVisible();
  });

  test('should handle browser back button', async ({ page }) => {
    // Navigate to map
    const mapLink = page.locator('text=/Mapa|Centros/i').first();

    if (await mapLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await mapLink.click();
      await page.waitForURL('**/map', { timeout: 5000 });

      // Go back
      await page.goBack();
      await page.waitForURL('**/dashboard', { timeout: 5000 });

      expect(page.url()).toContain('/dashboard');
    }
  });
});
