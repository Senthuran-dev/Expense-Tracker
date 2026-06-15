import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./features/dashboard/overview/overview').then(m => m.Overview),
    canActivate: [authGuard]
  },
  { 
    path: 'expenses', 
    loadComponent: () => import('./features/expenses/expense-list/expense-list').then(m => m.ExpenseList),
    canActivate: [authGuard]
  },
  { 
    path: 'analytics', 
    loadComponent: () => import('./features/analytics/charts-dashboard/charts-dashboard').then(m => m.ChartsDashboard),
    canActivate: [authGuard]
  },
  { 
    path: 'budgets', 
    loadComponent: () => import('./features/budgets/budget-list/budget-list').then(m => m.BudgetList),
    canActivate: [authGuard]
  },
  { 
    path: 'categories', 
    loadComponent: () => import('./features/categories/category-list/category-list').then(m => m.CategoryList),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'dashboard' }
];
