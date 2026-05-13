import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import HCSubscriptionResolve from './route/hc-subscription-routing-resolve.service';

const hCSubscriptionRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/hc-subscription.component').then(m => m.HCSubscriptionComponent),
    data: {},
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/hc-subscription-detail.component').then(m => m.HCSubscriptionDetailComponent),
    resolve: {
      hCSubscription: HCSubscriptionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/hc-subscription-update.component').then(m => m.HCSubscriptionUpdateComponent),
    resolve: {
      hCSubscription: HCSubscriptionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/hc-subscription-update.component').then(m => m.HCSubscriptionUpdateComponent),
    resolve: {
      hCSubscription: HCSubscriptionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default hCSubscriptionRoute;
