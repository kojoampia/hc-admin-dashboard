import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import FacilityResolve from './route/facility-routing-resolve.service';

const facilityRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/facility.component').then(m => m.FacilityComponent),
    data: {},
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/facility-detail.component').then(m => m.FacilityDetailComponent),
    resolve: {
      facility: FacilityResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/facility-update.component').then(m => m.FacilityUpdateComponent),
    resolve: {
      facility: FacilityResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/facility-update.component').then(m => m.FacilityUpdateComponent),
    resolve: {
      facility: FacilityResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default facilityRoute;
