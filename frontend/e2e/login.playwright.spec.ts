import { test, expect } from '@playwright/test';

test('Login: rechaza una contraseña incorrecta y permite el acceso válido', async ({ page }) => {
  const email = process.env['E2E_ADMIN_EMAIL']?.trim();
  const password = process.env['E2E_ADMIN_PASSWORD'];
  if (!email || !password) {
    throw new Error('Configura E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD para ejecutar la prueba.');
  }

  await page.goto('/login');
  await expect(page.locator('#login-title')).toHaveText('Iniciar sesión');

  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(`${password}incorrecta`);
  await page.locator('.login-submit').click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);

  await page.locator('#login-password').fill(password);
  await page.locator('.login-submit').click();

  await expect(page).toHaveURL(/\/inicio$/);
  await expect(page.locator('#inicio-title')).toContainText('Bienvenido,');
  await expect(page.locator('#inicio-role')).toContainText('Administrador');
});
