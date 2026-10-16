import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { afterEach, describe, expect, it } from 'vitest';
import { AuthService } from '../../core/auth.service';
import { Inicio } from './inicio';

const session = signal({ nombre: 'Usuario de Prueba', rol: 'Administrador' });

describe('Inicio limitado al usuario autenticado', () => {
  afterEach(() => TestBed.resetTestingModule());

  for (const rol of ['Administrador', 'Operador de Almacén']) {
    it(`muestra nombre y rol para ${rol}, sin módulos operativos`, async () => {
      session.set({ nombre: 'Usuario de Prueba', rol });
      await TestBed.configureTestingModule({
        imports: [Inicio],
        providers: [{ provide: AuthService, useValue: { session } }],
      }).compileComponents();
      const fixture = TestBed.createComponent(Inicio);
      fixture.detectChanges();
      const element = fixture.nativeElement as HTMLElement;
      expect(element.querySelector('h1')?.textContent).toContain('Usuario de Prueba');
      expect(element.querySelector('#inicio-role')?.textContent).toContain(rol);
      expect(element.querySelectorAll('a, button, table').length).toBe(0);
    });
  }
});
