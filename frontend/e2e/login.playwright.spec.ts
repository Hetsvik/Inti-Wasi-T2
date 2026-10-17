import { test, expect, type Page } from '@playwright/test';

const administrador = {
  correo: process.env['E2E_ADMIN_EMAIL'] || '',
  contrasena: process.env['E2E_ADMIN_PASSWORD'] || '',
};

const operador = {
  correo: process.env['E2E_OPERADOR_EMAIL'] || '',
  contrasena: process.env['E2E_OPERADOR_PASSWORD'] || '',
};

const inactivo = {
  correo: process.env['E2E_INACTIVO_EMAIL'] || '',
  contrasena: process.env['E2E_INACTIVO_PASSWORD'] || '',
};

test.beforeAll(() => {
  if (
    !administrador.correo ||
    !administrador.contrasena ||
    !operador.correo ||
    !operador.contrasena ||
    !inactivo.correo ||
    !inactivo.contrasena
  ) {
    throw new Error('Completa las seis variables del archivo .env.');
  }
});

test.beforeEach(async ({ page }) => {
  await page.goto('/login');

  await expect(page.locator('#login-title')).toHaveText(
    'Iniciar sesión',
  );
});

test.afterEach(async ({ page }, testInfo) => {
  const captura = await page.screenshot({
    path: testInfo.outputPath('evidencia.png'),
    fullPage: true,
    mask: [page.locator('#login-password')],
  });

  await testInfo.attach('Captura del caso', {
    body: captura,
    contentType: 'image/png',
  });

  await testInfo.attach('Datos de ejecución', {
    body: Buffer.from(
      JSON.stringify(
        {
          caso: testInfo.title,
          fecha: new Date().toISOString(),
          url: page.url(),
          estado: testInfo.status,
        },
        null,
        2,
      ),
    ),
    contentType: 'application/json',
  });
});

async function iniciarSesion(
  page: Page,
  correo: string,
  contrasena: string,
) {
  await page.locator('#login-email').fill(correo);
  await page.locator('#login-password').fill(contrasena);
  await page.locator('.login-submit').click();

  await expect(page).toHaveURL('http://localhost:4200/inicio');
}

test('CP-T2-01 - Inicio de sesión del Administrador', async ({ page }) => {
  await iniciarSesion(
    page,
    administrador.correo,
    administrador.contrasena,
  );

  await expect(page.locator('#inicio-title')).toHaveText(
    'Bienvenido, Misael Andrés Vergara Morales',
  );

  await expect(page.locator('#inicio-role')).toHaveText(
    'Rol: Administrador',
  );
});

test('CP-T2-02 - Inicio de sesión del Operador', async ({ page }) => {
  await iniciarSesion(page, operador.correo, operador.contrasena);

  await expect(page.locator('#inicio-title')).toHaveText(
    'Bienvenido, Kevin André de La Cruz Villugas',
  );

  await expect(page.locator('#inicio-role')).toHaveText(
    'Rol: Operador de Almacén',
  );
});

test('CP-T2-03 - Rechazo de contraseña incorrecta', async ({ page }) => {
  await page.locator('#login-email').fill(administrador.correo);

  await page.locator('#login-password').fill(
    administrador.contrasena + '_incorrecta',
  );

  const respuestaPendiente = page.waitForResponse(
    (respuesta) =>
      respuesta.url().endsWith('/api/auth/login') &&
      respuesta.request().method() === 'POST',
  );

  await page.locator('.login-submit').click();

  const respuesta = await respuestaPendiente;

  expect(respuesta.status()).toBe(401);

  await expect(page.getByRole('alert')).toContainText(
    'Correo o contraseña incorrectos',
  );

  await expect(page).toHaveURL('http://localhost:4200/login');

  const sesion = await page.evaluate(() =>
    sessionStorage.getItem('intiwasi.session'),
  );

  expect(sesion).toBeNull();
});

test('CP-T2-04 - Rechazo de correo no registrado', async ({ page }) => {
  await page.locator('#login-email').fill(
    'no.registrado.t2@intiwasi.pe',
  );

  await page.locator('#login-password').fill('ClaveDePrueba_T2!');

  const respuestaPendiente = page.waitForResponse(
    (respuesta) =>
      respuesta.url().endsWith('/api/auth/login') &&
      respuesta.request().method() === 'POST',
  );

  await page.locator('.login-submit').click();

  const respuesta = await respuestaPendiente;

  expect(respuesta.status()).toBe(401);

  await expect(page.getByRole('alert')).toContainText(
    'Correo o contraseña incorrectos',
  );

  await expect(page).toHaveURL('http://localhost:4200/login');

  const sesion = await page.evaluate(() =>
    sessionStorage.getItem('intiwasi.session'),
  );

  expect(sesion).toBeNull();
});

test('CP-T2-05 - Rechazo de usuario inactivo', async ({ page }) => {
  await page.locator('#login-email').fill(inactivo.correo);
  await page.locator('#login-password').fill(inactivo.contrasena);

  const respuestaPendiente = page.waitForResponse(
    (respuesta) =>
      respuesta.url().endsWith('/api/auth/login') &&
      respuesta.request().method() === 'POST',
  );

  await page.locator('.login-submit').click();

  const respuesta = await respuestaPendiente;

  expect(respuesta.status()).toBe(401);

  await expect(page.getByRole('alert')).toContainText(
    'Su cuenta no está disponible. Contacte al Administrador.',
  );

  await expect(page).toHaveURL('http://localhost:4200/login');

  const sesion = await page.evaluate(() =>
    sessionStorage.getItem('intiwasi.session'),
  );

  expect(sesion).toBeNull();
});

test('CP-T2-06 - Validación de campos vacíos', async ({ page }) => {
  let solicitudesLogin = 0;

  page.on('request', (solicitud) => {
    if (
      solicitud.url().endsWith('/api/auth/login') &&
      solicitud.method() === 'POST'
    ) {
      solicitudesLogin++;
    }
  });

  await page.locator('.login-submit').click();

  await expect(page.locator('mat-error')).toHaveText([
    'Ingresa tu correo electrónico.',
    'Ingresa tu contraseña.',
  ]);

  await expect(page).toHaveURL('http://localhost:4200/login');

  expect(solicitudesLogin).toBe(0);
});

test('CP-T2-07 - Validación del formato del correo', async ({ page }) => {
  let solicitudesLogin = 0;

  page.on('request', (solicitud) => {
    if (
      solicitud.url().endsWith('/api/auth/login') &&
      solicitud.method() === 'POST'
    ) {
      solicitudesLogin++;
    }
  });

  await page.locator('#login-email').fill('correo-invalido');
  await page.locator('#login-password').fill('ClaveDePrueba_T2!');
  await page.locator('.login-submit').click();

  await expect(page.locator('mat-error')).toHaveText(
    'Ingresa un correo válido, por ejemplo rol.nombre@intiwasi.pe.',
  );

  await expect(page).toHaveURL('http://localhost:4200/login');

  expect(solicitudesLogin).toBe(0);
});

test('CP-T2-08 - Acceso a inicio sin sesión', async ({ page }) => {
  await page.goto('/inicio');

  await expect(page).toHaveURL('http://localhost:4200/login');

  await expect(page.locator('#login-title')).toHaveText(
    'Iniciar sesión',
  );

  await expect(page.locator('#inicio-title')).toHaveCount(0);

  const sesion = await page.evaluate(() =>
    sessionStorage.getItem('intiwasi.session'),
  );

  expect(sesion).toBeNull();
});

test('CP-T2-09 - Operador sin permiso para consultar usuarios', async ({
  page,
}, testInfo) => {
  await iniciarSesion(page, operador.correo, operador.contrasena);

  await expect(page.locator('#inicio-role')).toHaveText(
    'Rol: Operador de Almacén',
  );

  const token = await page.evaluate(() => {
    const sesion = JSON.parse(
      sessionStorage.getItem('intiwasi.session') || 'null',
    );

    return sesion?.token;
  });

  expect(Boolean(token)).toBe(true);

  const respuesta = await page.request.get(
    'http://localhost:8080/api/usuarios',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  await testInfo.attach('Respuesta de autorización', {
    body: Buffer.from(
      JSON.stringify(
        {
          metodo: 'GET',
          endpoint: 'http://localhost:8080/api/usuarios',
          rol: 'Operador de Almacén',
          estadoEsperado: 403,
          estadoObtenido: respuesta.status(),
        },
        null,
        2,
      ),
    ),
    contentType: 'application/json',
  });

  expect(respuesta.status()).toBe(403);

  const contenido = await respuesta.json();

  expect(Array.isArray(contenido)).toBe(false);
});

test('CP-T2-10 - Cierre de sesión y bloqueo del acceso', async ({
  page,
}) => {
  await iniciarSesion(
    page,
    administrador.correo,
    administrador.contrasena,
  );

  await page.getByRole('button', { name: 'Cerrar sesión' }).click();

  await expect(page).toHaveURL('http://localhost:4200/login');

  const sesion = await page.evaluate(() =>
    sessionStorage.getItem('intiwasi.session'),
  );

  expect(sesion).toBeNull();

  await page.goto('/inicio');

  await expect(page).toHaveURL('http://localhost:4200/login');

  await expect(page.locator('#login-title')).toHaveText(
    'Iniciar sesión',
  );

  await expect(page.locator('#inicio-title')).toHaveCount(0);
});