import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import FacilityCatalogResolve from './route/facility-catalog-routing-resolve.service';

const facilityCatalogRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/facility-catalog.component').then(m => m.FacilityCatalogComponent),
    data: {},
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/facility-catalog-detail.component').then(m => m.FacilityCatalogDetailComponent),
    resolve: {
      facilityCatalog: FacilityCatalogResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/facility-catalog-update.component').then(m => m.FacilityCatalogUpdateComponent),
    resolve: {
      facilityCatalog: FacilityCatalogResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/facility-catalog-update.component').then(m => m.FacilityCatalogUpdateComponent),
    resolve: {
      facilityCatalog: FacilityCatalogResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default facilityCatalogRoute;
