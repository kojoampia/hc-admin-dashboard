import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import SystemCatalogResolve from './route/system-catalog-routing-resolve.service';

const systemCatalogRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/system-catalog.component').then(m => m.SystemCatalogComponent),
    data: { authorities: ['ROLE_ADMIN', 'ROLE_OPERATOR'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/system-catalog-detail.component').then(m => m.SystemCatalogDetailComponent),
    resolve: {
      systemCatalog: SystemCatalogResolve,
    },
    data: { authorities: ['ROLE_ADMIN', 'ROLE_OPERATOR'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/system-catalog-update.component').then(m => m.SystemCatalogUpdateComponent),
    resolve: {
      systemCatalog: SystemCatalogResolve,
    },
    data: { authorities: ['ROLE_ADMIN'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/system-catalog-update.component').then(m => m.SystemCatalogUpdateComponent),
    resolve: {
      systemCatalog: SystemCatalogResolve,
    },
    data: { authorities: ['ROLE_ADMIN'] },
    canActivate: [UserRouteAccessService],
  },
];

export default systemCatalogRoute;
