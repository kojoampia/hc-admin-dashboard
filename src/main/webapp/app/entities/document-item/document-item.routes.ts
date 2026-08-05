import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import DocumentItemResolve from './route/document-item-routing-resolve.service';

const documentItemRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/document-item.component').then(m => m.DocumentItemComponent),
    data: { authorities: ['ROLE_ADMIN', 'ROLE_OPERATOR'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/document-item-detail.component').then(m => m.DocumentItemDetailComponent),
    resolve: {
      documentItem: DocumentItemResolve,
    },
    data: { authorities: ['ROLE_ADMIN', 'ROLE_OPERATOR'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/document-item-update.component').then(m => m.DocumentItemUpdateComponent),
    resolve: {
      documentItem: DocumentItemResolve,
    },
    data: { authorities: ['ROLE_ADMIN'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/document-item-update.component').then(m => m.DocumentItemUpdateComponent),
    resolve: {
      documentItem: DocumentItemResolve,
    },
    data: { authorities: ['ROLE_ADMIN'] },
    canActivate: [UserRouteAccessService],
  },
];

export default documentItemRoute;
