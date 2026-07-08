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
    path: '',
    loadComponent: () => import('./features/layout/app-shell/app-shell').then(m => m.AppShell),
    canActivate: [authGuard],
    children: [
      { 
        path: 'dashboard', 
        loadComponent: () => import('./features/dashboard/overview/overview').then(m => m.Overview)
      },
      { 
        path: 'expenses', 
        loadComponent: () => import('./features/expenses/expense-list/expense-list').then(m => m.ExpenseList)
      },
      { 
        path: 'analytics', 
        loadComponent: () => import('./features/analytics/charts-dashboard/charts-dashboard').then(m => m.ChartsDashboard)
      },
      { 
        path: 'budgets', 
        loadComponent: () => import('./features/budgets/budget-list/budget-list').then(m => m.BudgetList)
      },
      { 
        path: 'categories', 
        loadComponent: () => import('./features/categories/category-list/category-list').then(m => m.CategoryList)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/profile-settings/profile-settings').then(m => m.ProfileSettings)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
