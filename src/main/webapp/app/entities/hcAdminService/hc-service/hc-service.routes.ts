import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import HCServiceResolve from './route/hc-service-routing-resolve.service';

const hCServiceRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/hc-service.component').then(m => m.HCServiceComponent),
    data: {},
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/hc-service-detail.component').then(m => m.HCServiceDetailComponent),
    resolve: {
      hCService: HCServiceResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/hc-service-update.component').then(m => m.HCServiceUpdateComponent),
    resolve: {
      hCService: HCServiceResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/hc-service-update.component').then(m => m.HCServiceUpdateComponent),
    resolve: {
      hCService: HCServiceResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default hCServiceRoute;
