import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'iw-inicio',
  template: `
    <section class="panel welcome" aria-labelledby="inicio-title">
      <h1 id="inicio-title" tabindex="-1">Bienvenido, {{ auth.session()?.nombre }}</h1>
      <p id="inicio-role"><strong>Rol:</strong> {{ auth.session()?.rol }}</p>
    </section>
  `,
  styles: `
    :host { display: block; width: 100%; }
    .welcome { padding: clamp(28px, 6vw, 64px); }
    h1 { font-size: clamp(26px, 4vw, 38px); line-height: 1.25; overflow-wrap: anywhere; }
    p { margin-top: 20px; font-size: 16px; color: var(--muted); }
    strong { color: var(--ink); font-weight: 600; }
  `,
})
export class Inicio {
  readonly auth = inject(AuthService);
}
