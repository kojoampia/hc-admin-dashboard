import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import ProfileResolve from './route/profile-routing-resolve.service';

const profileRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/profile.component').then(m => m.ProfileListComponent),
    data: { authorities: ['ROLE_ADMIN', 'ROLE_OPERATOR'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/profile-detail.component').then(m => m.ProfileDetailComponent),
    resolve: {
      profile: ProfileResolve,
    },
    data: { authorities: ['ROLE_ADMIN', 'ROLE_OPERATOR'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/profile-update.component').then(m => m.ProfileUpdateComponent),
    resolve: {
      profile: ProfileResolve,
    },
    data: { authorities: ['ROLE_ADMIN'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/profile-update.component').then(m => m.ProfileUpdateComponent),
    resolve: {
      profile: ProfileResolve,
    },
    data: { authorities: ['ROLE_ADMIN'] },
    canActivate: [UserRouteAccessService],
  },
];

export default profileRoute;
