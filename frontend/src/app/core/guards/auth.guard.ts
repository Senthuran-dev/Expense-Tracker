import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // TODO: Replace with an actual authentication service call
  const token = localStorage.getItem('access_token');
  
  if (token) {
    return true;
  }
  
  return router.parseUrl('/login');
};
