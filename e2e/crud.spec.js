import { test, expect } from '@playwright/test';

const TEST_PREFIX = `E2E-TEST-${Date.now()}`;

test.describe('Inventory CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@dfa.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page.locator('#dashboardPage')).toBeVisible({ timeout: 15000 });
  });

  test('navigate to inventory page', async ({ page }) => {
    await page.click('[data-page="inventory"]');
    await expect(page.locator('#inventoryPage')).toBeVisible();
  });

  test('create a new inventory item', async ({ page }) => {
    await page.click('[data-page="inventory"]');
    await expect(page.locator('#inventoryPage')).toBeVisible();
    await page.click('#newItemButton');
    await expect(page.locator('#modal')).toBeVisible();

    await page.fill('#modal [name="name"]', `${TEST_PREFIX}-Item`);
    await page.fill('#modal [name="code"]', `${TEST_PREFIX}-COD`);
    await page.fill('#modal [name="category"]', 'E2E Teste');
    await page.fill('#modal [name="location"]', 'Sala E2E');
    await page.fill('#modal [name="quantity"]', '5');
    await page.fill('#modal [name="minimum"]', '1');
    await page.fill('#modal [name="value"]', '100');

    await page.click('#modal button[type="submit"]');
    await expect(page.locator('#modal')).not.toBeVisible({ timeout: 10000 });
  });

  test('search for test item', async ({ page }) => {
    await page.click('[data-page="inventory"]');
    await expect(page.locator('#inventoryPage')).toBeVisible();

    await page.fill('#inventorySearch', TEST_PREFIX);
    await page.waitForTimeout(500);
    await expect(page.locator('#inventoryTable')).toBeVisible();
  });
});
