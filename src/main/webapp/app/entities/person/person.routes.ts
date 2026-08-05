import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import PersonResolve from './route/person-routing-resolve.service';

const personRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/person.component').then(m => m.PersonComponent),
    data: { authorities: ['ROLE_ADMIN', 'ROLE_OPERATOR'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/person-detail.component').then(m => m.PersonDetailComponent),
    resolve: {
      person: PersonResolve,
    },
    data: { authorities: ['ROLE_ADMIN', 'ROLE_OPERATOR'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/person-update.component').then(m => m.PersonUpdateComponent),
    resolve: {
      person: PersonResolve,
    },
    data: { authorities: ['ROLE_ADMIN'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/person-update.component').then(m => m.PersonUpdateComponent),
    resolve: {
      person: PersonResolve,
    },
    data: { authorities: ['ROLE_ADMIN'] },
    canActivate: [UserRouteAccessService],
  },
];

export default personRoute;
