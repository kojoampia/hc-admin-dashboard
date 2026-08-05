import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import FacilityResolve from './route/facility-routing-resolve.service';

const facilityRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/facility.component').then(m => m.FacilityComponent),
    data: { authorities: ['ROLE_ADMIN', 'ROLE_OPERATOR'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/facility-detail.component').then(m => m.FacilityDetailComponent),
    resolve: {
      facility: FacilityResolve,
    },
    data: { authorities: ['ROLE_ADMIN', 'ROLE_OPERATOR'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/facility-update.component').then(m => m.FacilityUpdateComponent),
    resolve: {
      facility: FacilityResolve,
    },
    data: { authorities: ['ROLE_ADMIN'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/facility-update.component').then(m => m.FacilityUpdateComponent),
    resolve: {
      facility: FacilityResolve,
    },
    data: { authorities: ['ROLE_ADMIN'] },
    canActivate: [UserRouteAccessService],
  },
];

export default facilityRoute;
