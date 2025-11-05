import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Debe estar autenticado primero
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    const allowed: string[] = route.data?.['roles'] || [];
    if (!allowed || allowed.length === 0) {
      return true; // Si no se especifican roles, permitir (solo requiere login)
    }

    const role = this.auth.getCurrentUserRole();
    if (role && allowed.includes(role)) {
      return true;
    }

    // Si no tiene rol permitido, redirigir al home
    this.router.navigate(['/home']);
    return false;
  }
}
