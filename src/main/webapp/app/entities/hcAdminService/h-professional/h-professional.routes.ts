import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import HProfessionalResolve from './route/h-professional-routing-resolve.service';

const hProfessionalRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/h-professional.component').then(m => m.HProfessionalComponent),
    data: {},
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/h-professional-detail.component').then(m => m.HProfessionalDetailComponent),
    resolve: {
      hProfessional: HProfessionalResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/h-professional-update.component').then(m => m.HProfessionalUpdateComponent),
    resolve: {
      hProfessional: HProfessionalResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/h-professional-update.component').then(m => m.HProfessionalUpdateComponent),
    resolve: {
      hProfessional: HProfessionalResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default hProfessionalRoute;
