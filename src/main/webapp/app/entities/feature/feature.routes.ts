import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import FeatureResolve from './route/feature-routing-resolve.service';

const featureRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/feature.component').then(m => m.FeatureComponent),
    data: {},
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/feature-detail.component').then(m => m.FeatureDetailComponent),
    resolve: {
      feature: FeatureResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/feature-update.component').then(m => m.FeatureUpdateComponent),
    resolve: {
      feature: FeatureResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/feature-update.component').then(m => m.FeatureUpdateComponent),
    resolve: {
      feature: FeatureResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default featureRoute;
