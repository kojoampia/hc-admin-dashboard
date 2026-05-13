import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import PricingPlanResolve from './route/pricing-plan-routing-resolve.service';

const pricingPlanRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/pricing-plan.component').then(m => m.PricingPlanComponent),
    data: {},
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/pricing-plan-detail.component').then(m => m.PricingPlanDetailComponent),
    resolve: {
      pricingPlan: PricingPlanResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/pricing-plan-update.component').then(m => m.PricingPlanUpdateComponent),
    resolve: {
      pricingPlan: PricingPlanResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/pricing-plan-update.component').then(m => m.PricingPlanUpdateComponent),
    resolve: {
      pricingPlan: PricingPlanResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default pricingPlanRoute;
