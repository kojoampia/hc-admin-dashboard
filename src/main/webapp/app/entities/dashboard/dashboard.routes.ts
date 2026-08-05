import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import DashboardResolve from './route/dashboard-routing-resolve.service';

const dashboardRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard-component').then(m => m.DashboardComponent),
    data: { authorities: ['ROLE_ADMIN', 'ROLE_OPERATOR'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'manage',
    loadComponent: () => import('./list/dashboard.component').then(m => m.DashboardComponent),
    data: { authorities: ['ROLE_ADMIN', 'ROLE_OPERATOR'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/dashboard-detail.component').then(m => m.DashboardDetailComponent),
    resolve: {
      dashboard: DashboardResolve,
    },
    data: { authorities: ['ROLE_ADMIN', 'ROLE_OPERATOR'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/dashboard-update.component').then(m => m.DashboardUpdateComponent),
    resolve: {
      dashboard: DashboardResolve,
    },
    data: { authorities: ['ROLE_ADMIN'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/dashboard-update.component').then(m => m.DashboardUpdateComponent),
    resolve: {
      dashboard: DashboardResolve,
    },
    data: { authorities: ['ROLE_ADMIN'] },
    canActivate: [UserRouteAccessService],
  },
];

export default dashboardRoute;
