import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import PhotoResolve from './route/photo-routing-resolve.service';

const photoRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/photo.component').then(m => m.PhotoComponent),
    data: { authorities: ['ROLE_ADMIN', 'ROLE_OPERATOR'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/photo-detail.component').then(m => m.PhotoDetailComponent),
    resolve: {
      photo: PhotoResolve,
    },
    data: { authorities: ['ROLE_ADMIN', 'ROLE_OPERATOR'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/photo-update.component').then(m => m.PhotoUpdateComponent),
    resolve: {
      photo: PhotoResolve,
    },
    data: { authorities: ['ROLE_ADMIN'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/photo-update.component').then(m => m.PhotoUpdateComponent),
    resolve: {
      photo: PhotoResolve,
    },
    data: { authorities: ['ROLE_ADMIN'] },
    canActivate: [UserRouteAccessService],
  },
];

export default photoRoute;
