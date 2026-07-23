import { test, expect } from '@playwright/test';

test.describe('Login flow', () => {
  test('login page loads and shows form', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#loginForm')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@dfa.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('#toast')).toBeVisible({ timeout: 10000 });
  });

  test('login with valid credentials navigates to dashboard', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@dfa.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page.locator('#dashboardPage')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#sidebar')).toBeVisible();
  });

  test('session persists after page reload', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@dfa.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page.locator('#dashboardPage')).toBeVisible({ timeout: 15000 });

    await page.reload();
    await expect(page.locator('#dashboardPage')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Logout', () => {
  test('logout returns to login form', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@dfa.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page.locator('#dashboardPage')).toBeVisible({ timeout: 15000 });

    await page.click('#logoutButton');
    await expect(page.locator('#loginForm')).toBeVisible({ timeout: 10000 });
  });
});
