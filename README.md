# Inti Wasi

Aplicación web para la gestión de inventario y operaciones de almacén de la Distribuidora Inti Wasi S.A.C.

## Alcance de la entrega

El backend incluye la gestión de usuarios, categorías, proveedores, productos, órdenes de compra, entradas, salidas, ajustes, documentos, movimientos, indicadores y reportes.

El frontend incluye:

- Inicio de sesión.
- Validación de credenciales.
- Pantalla de Inicio con el nombre y el rol del usuario.
- Cierre de sesión.
- Tema claro y oscuro.

Tanto el Administrador como el Operador de Almacén acceden a `/inicio` después de autenticarse.

## Tecnologías

- **Backend:** Java 25 y Spring Boot.
- **Frontend:** Angular 22 y TypeScript.
- **Base de datos:** MySQL 8.
- **Autenticación:** Spring Security y JWT.
- **Pruebas:** JUnit, Mockito, Vitest y Playwright.

## Requisitos

- JDK 25.
- MySQL 8.
- Node.js 24.15 o una versión posterior compatible de la rama 24.
- npm.

El proyecto incluye Maven Wrapper.

## Estructura

```text
Inti-Wasi-T2/
├── backend/
├── frontend/
├── database/
├── docs/
└── screenshots/
```

## Base de datos

Para una instalación nueva, ejecuta los scripts de la carpeta `database` en este orden:

1. `01_DDL_bd_intiwasi.sql`
2. `02_Triggers_bd_intiwasi.sql`
3. `03_DML_bd_intiwasi.sql`
4. `04_Vistas_bd_intiwasi.sql`

Los scripts crean la base `bd_intiwasi`, sus tablas, reglas de integridad, datos iniciales, procedimiento almacenado y vistas.

**Importante:** el script DDL elimina y vuelve a crear la base de datos. Haz un respaldo si necesitas conservar información. Si ya tienes la base configurada y actualizada, no es necesario ejecutar nuevamente los scripts.

## Configuración del backend

En `backend/src/main/resources`, copia:

```text
application-local.properties.example
```

y guarda la copia como:

```text
application-local.properties
```

Configura en ese archivo:

- Dirección de conexión a MySQL.
- Usuario de la base de datos.
- Contraseña de la base de datos.
- Clave de firma JWT de al menos 32 bytes.

El archivo de configuración local está excluido de Git mediante `.gitignore`.

## Ejecutar el backend

1. Abre la carpeta del proyecto en Visual Studio Code.
2. Comprueba que MySQL esté funcionando y que `application-local.properties` tenga la configuración de conexión.
3. Abre el archivo:

   ```text
   backend/src/main/java/com/intiwasi/backend/BackendApplication.java
   ```

4. Haz clic derecho dentro del archivo y selecciona **Run Java**.
5. Espera a que la terminal muestre `Started BackendApplication`.

El backend se ejecuta en:

```text
http://localhost:8080
```

Para ejecutarlo desde Visual Studio Code, necesitas las extensiones de Java, como **Extension Pack for Java**, y tener configurado el JDK 25.
```

## Ejecutar el frontend

Abre otra terminal desde la carpeta del proyecto:

```powershell
cd frontend
npm ci
npm start
```

Abre la aplicación en:

```text
http://localhost:4200
```

El frontend utiliza un proxy para enviar las solicitudes `/api` al backend del puerto 8080.

## Acceso y sesión

Inicia sesión con una cuenta activa registrada en la base de datos.

La aplicación verifica las credenciales y consulta la identidad del usuario antes de mostrar la pantalla de Inicio.

Las rutas protegidas requieren una sesión válida. El backend controla los permisos de cada rol.

La sesión tiene un vencimiento predeterminado de ocho horas. Después de quince minutos de inactividad, aparece un aviso con treinta segundos para confirmar la continuidad. Esta confirmación no extiende el vencimiento del JWT.

Al cerrar sesión, se elimina la información de sesión del navegador.

## Pruebas del frontend

Desde la carpeta `frontend`:

```powershell
npm run build
npm test -- --watch=false
```

Estos comandos comprueban la compilación y ejecutan las pruebas unitarias.

### Pruebas de navegador con el backend

Con frontend y backend funcionando, configura las variables de entorno `E2E_ADMIN_EMAIL` y `E2E_ADMIN_PASSWORD` con una cuenta Administrador de prueba.

Después ejecuta:

```powershell
npx playwright install chromium
npm run test:e2e
```

La prueba verifica el rechazo de una contraseña incorrecta y el acceso válido a Inicio.

### Pruebas de interfaz con API simulada

Con el frontend funcionando:

```powershell
npx playwright install chromium
npm run test:e2e:mock
```

Estas pruebas comprueban el comportamiento de la interfaz para Administrador y Operador utilizando respuestas simuladas. No verifican la conexión real con MySQL ni la ejecución de los servicios del backend.