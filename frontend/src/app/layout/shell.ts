import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../core/auth.service';
import { ThemeService } from '../core/theme.service';
import { Icon } from '../shared/icon';

@Component({
  selector: 'iw-shell',
  imports: [RouterOutlet, RouterLink, MatButtonModule, Icon],
  template: `
    <a class="skip-link" href="#contenido">Saltar al contenido</a>
    <div class="workspace">
      <header class="topbar">
        <a routerLink="/inicio" class="brand" aria-label="Inti Wasi, inicio">
          <img src="marca.svg" width="38" height="38" alt="" />
          <span>Inti Wasi<small>DISTRIBUIDORA</small></span>
        </a>
        <div class="account">
          <button mat-button type="button" class="theme-toggle"
            (click)="theme.toggle()" [attr.aria-pressed]="theme.isDark()"
            [attr.aria-label]="theme.isDark() ? 'Activar modo claro' : 'Activar modo oscuro'">
            <iw-icon [name]="theme.isDark() ? 'sun' : 'moon'" />
            <span>{{ theme.isDark() ? 'Activar modo claro' : 'Activar modo oscuro' }}</span>
          </button>
          <button mat-button type="button" (click)="auth.logout()">
            <iw-icon name="logout" /><span>Cerrar sesión</span>
          </button>
        </div>
      </header>
      <main id="contenido" class="main-content" tabindex="-1"><router-outlet /></main>
      <footer class="app-footer"><span>Distribuidora Inti Wasi S.A.C.</span></footer>
    </div>
  `,
  styles: `
    :host { display: block; }
    .workspace { min-height: 100dvh; }
    .topbar { flex-wrap: wrap; }
    .account { flex-wrap: wrap; }
    .main-content { display: flex; align-items: center; max-width: 960px; }
    .brand { text-decoration: none; }
    @media (max-width: 600px) {
      .topbar { padding: 18px 20px; gap: 16px; }
      .account { width: 100%; justify-content: space-between; }
      .main-content { padding: 32px 20px; }
      .app-footer { padding: 18px 20px; }
    }
  `,
})
export class Shell {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);

  constructor() {
    inject(Router).events.pipe(
      filter((event) => event instanceof NavigationEnd),
      takeUntilDestroyed(),
    ).subscribe(() => {
      requestAnimationFrame(() => document.querySelector<HTMLElement>('main h1')?.focus());
    });
  }
}
