import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  const allowedRoles = route.data['roles'] as string[] | undefined;
  const currentRole = authService.userRole();

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentRole ?? '')) {
    // مسجل دخول بس دوره مش مسموح لهاي الصفحة
    return router.createUrlTree(['/stadiums']);
  }

  return true;
};