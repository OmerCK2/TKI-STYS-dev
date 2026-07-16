import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private auth = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.auth.isAuthenticated()) {
      if (this.auth.requiresPasswordChange() && state.url !== '/change-password') {
        this.router.navigate(['/change-password']);
        return false;
      }
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
