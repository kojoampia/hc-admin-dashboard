import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import AddressResolve from './route/address-routing-resolve.service';

const addressRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/address.component').then(m => m.AddressComponent),
    data: { authorities: ['ROLE_ADMIN', 'ROLE_OPERATOR'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/address-detail.component').then(m => m.AddressDetailComponent),
    resolve: {
      address: AddressResolve,
    },
    data: { authorities: ['ROLE_ADMIN', 'ROLE_OPERATOR'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/address-update.component').then(m => m.AddressUpdateComponent),
    resolve: {
      address: AddressResolve,
    },
    data: { authorities: ['ROLE_ADMIN'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/address-update.component').then(m => m.AddressUpdateComponent),
    resolve: {
      address: AddressResolve,
    },
    data: { authorities: ['ROLE_ADMIN'] },
    canActivate: [UserRouteAccessService],
  },
];

export default addressRoute;
