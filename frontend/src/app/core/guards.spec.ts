import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';
import { authGuard, guestGuard } from './guards';

const route = {} as ActivatedRouteSnapshot;
const state = {} as RouterStateSnapshot;

describe('Protección de Login e Inicio', () => {
  afterEach(() => TestBed.resetTestingModule());

  for (const valid of [false, true]) {
    it(`resuelve las rutas con sesión ${valid ? 'válida' : 'ausente'}`, async () => {
      TestBed.configureTestingModule({
        providers: [provideRouter([]), {
          provide: AuthService,
          useValue: { ensure: vi.fn().mockResolvedValue(valid), landingRoute: () => '/inicio' },
        }],
      });
      const router = TestBed.inject(Router);
      const protectedResult = await TestBed.runInInjectionContext(() => authGuard(route, state));
      const guestResult = await TestBed.runInInjectionContext(() => guestGuard(route, state));
      if (valid) {
        expect(protectedResult).toBe(true);
        expect(router.serializeUrl(guestResult as UrlTree)).toBe('/inicio');
      } else {
        expect(router.serializeUrl(protectedResult as UrlTree)).toBe('/login');
        expect(guestResult).toBe(true);
      }
    });
  }
});
