import { test, expect } from '@playwright/test';

test.describe('Role-based permissions', () => {
  test('admin can see all navigation items', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@dfa.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page.locator('#dashboardPage')).toBeVisible({ timeout: 15000 });

    await expect(page.locator('[data-page="dashboard"]')).toBeVisible();
    await expect(page.locator('[data-page="inventory"]')).toBeVisible();
    await expect(page.locator('[data-page="requests"]')).toBeVisible();
    await expect(page.locator('[data-page="custody"]')).toBeVisible();
    await expect(page.locator('[data-page="movements"]')).toBeVisible();
    await expect(page.locator('[data-page="reports"]')).toBeVisible();
  });

  test('requester sees only requests page', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'colaborador@dfa.com');
    await page.fill('input[type="password"]', 'solicitar123');
    await page.click('button[type="submit"]');
    await expect(page.locator('#requestsPage')).toBeVisible({ timeout: 15000 });

    await expect(page.locator('[data-page="dashboard"]')).not.toBeVisible();
    await expect(page.locator('[data-page="inventory"]')).not.toBeVisible();
    await expect(page.locator('[data-page="custody"]')).not.toBeVisible();
    await expect(page.locator('[data-page="movements"]')).not.toBeVisible();
    await expect(page.locator('[data-page="reports"]')).not.toBeVisible();
    await expect(page.locator('[data-page="requests"]')).toBeVisible();
  });

  test('requester cannot create a request without item name', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'colaborador@dfa.com');
    await page.fill('input[type="password"]', 'solicitar123');
    await page.click('button[type="submit"]');
    await expect(page.locator('#requestsPage')).toBeVisible({ timeout: 15000 });

    await page.click('#newRequestButton');
    await expect(page.locator('#modal')).toBeVisible();
    await page.click('#modal button[type="submit"]');
    await expect(page.locator('[data-error]')).toBeVisible();
  });

  test('manager can see navigation items except reports', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'gestor@dfa.com');
    await page.fill('input[type="password"]', 'gestor123');
    await page.click('button[type="submit"]');
    await expect(page.locator('#dashboardPage')).toBeVisible({ timeout: 15000 });

    await expect(page.locator('[data-page="dashboard"]')).toBeVisible();
    await expect(page.locator('[data-page="inventory"]')).toBeVisible();
    await expect(page.locator('[data-page="requests"]')).toBeVisible();
    await expect(page.locator('[data-page="custody"]')).toBeVisible();
    await expect(page.locator('[data-page="movements"]')).toBeVisible();
  });
});
