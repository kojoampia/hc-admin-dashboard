import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import PatientPlanResolve from './route/patient-plan-routing-resolve.service';

const patientPlanRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/patient-plan.component').then(m => m.PatientPlanComponent),
    data: { authorities: ['ROLE_ADMIN', 'ROLE_OPERATOR'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/patient-plan-detail.component').then(m => m.PatientPlanDetailComponent),
    resolve: {
      patientPlan: PatientPlanResolve,
    },
    data: { authorities: ['ROLE_ADMIN', 'ROLE_OPERATOR'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/patient-plan-update.component').then(m => m.PatientPlanUpdateComponent),
    resolve: {
      patientPlan: PatientPlanResolve,
    },
    data: { authorities: ['ROLE_ADMIN'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/patient-plan-update.component').then(m => m.PatientPlanUpdateComponent),
    resolve: {
      patientPlan: PatientPlanResolve,
    },
    data: { authorities: ['ROLE_ADMIN'] },
    canActivate: [UserRouteAccessService],
  },
];

export default patientPlanRoute;
