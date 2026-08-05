import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import OrganisationResolve from './route/organisation-routing-resolve.service';

const organisationRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/organisation.component').then(m => m.OrganisationComponent),
    data: { authorities: ['ROLE_ADMIN', 'ROLE_OPERATOR'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/organisation-detail.component').then(m => m.OrganisationDetailComponent),
    resolve: {
      organisation: OrganisationResolve,
    },
    data: { authorities: ['ROLE_ADMIN', 'ROLE_OPERATOR'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/organisation-update.component').then(m => m.OrganisationUpdateComponent),
    resolve: {
      organisation: OrganisationResolve,
    },
    data: { authorities: ['ROLE_ADMIN'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/organisation-update.component').then(m => m.OrganisationUpdateComponent),
    resolve: {
      organisation: OrganisationResolve,
    },
    data: { authorities: ['ROLE_ADMIN'] },
    canActivate: [UserRouteAccessService],
  },
];

export default organisationRoute;
