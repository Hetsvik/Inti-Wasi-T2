// Pruebas de interfaz con API SIMULADA: no prueban el backend ni MySQL.
import { test, expect, Page } from '@playwright/test';

async function simulateApi(page: Page, rol: string) {
  const token = `header.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.signature`;
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/auth/login') {
      const body = route.request().postDataJSON();
      if (body.contrasena !== 'ClaveSoloSimulada123!') {
        await route.fulfill({ status: 401, json: { message: 'Credenciales inválidas' } });
        return;
      }
      await route.fulfill({ json: { token, correo: body.correo, rol: `ROLE_${rol}` } });
      return;
    }
    if (url.pathname === '/api/auth/me') {
      const authorized = route.request().headers()['authorization'] === `Bearer ${token}`;
      await route.fulfill(authorized ? {
        json: {
          idUsuario: 1, nomUsuario: 'Usuario de Prueba', correo: 'prueba@intiwasi.test',
          rol, telefono: null, estado: 1, fechaRegistro: '2026-01-01T00:00:00',
        },
      } : { status: 401, json: { message: 'Sin sesión' } });
      return;
    }
    throw new Error(`El frontend limitado no debe consultar este endpoint: ${url.pathname}`);
  });
}

for (const rol of ['Administrador', 'Operador de Almacén']) {
  test(`API simulada: login, Inicio y logout de ${rol}`, async ({ page }) => {
    await simulateApi(page, rol);
    await page.goto('/inicio');
    await expect(page).toHaveURL(/\/login$/);
    await page.locator('.login-submit').click();
    await expect(page.locator('input.ng-invalid').first()).toBeVisible();
    await page.locator('#login-email').fill('prueba@intiwasi.test');
    await page.locator('#login-password').fill('incorrecta');
    await page.locator('.login-submit').click();
    await expect(page.getByRole('alert')).toContainText('Correo o contraseña incorrectos');
    await expect(page).toHaveURL(/\/login$/);
    await page.locator('#login-password').fill('ClaveSoloSimulada123!');
    await page.locator('.login-submit').click();
    await expect(page).toHaveURL(/\/inicio$/);
    await expect(page.locator('#inicio-title')).toHaveText('Bienvenido, Usuario de Prueba');
    await expect(page.locator('#inicio-role')).toContainText(rol);
    await expect(page.locator('aside, table')).toHaveCount(0);
    await page.reload();
    await expect(page.locator('#inicio-role')).toContainText(rol);
    await page.goto('/login');
    await expect(page).toHaveURL(/\/inicio$/);
    for (const path of ['/dashboard', '/usuarios', '/ordenes-compra', '/entradas', '/salidas', '/ajustes', '/productos', '/proveedores', '/categorias', '/documentos', '/movimientos', '/reportes']) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/inicio$/);
      await expect(page.locator('#inicio-title')).toBeVisible();
    }
    await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
    await expect(page).toHaveURL(/\/login$/);
    expect(await page.evaluate(() => sessionStorage.getItem('intiwasi.session'))).toBeNull();
    await page.goto('/inicio');
    await expect(page).toHaveURL(/\/login$/);
  });
}
