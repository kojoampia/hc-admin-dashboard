import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import ContactResolve from './route/contact-routing-resolve.service';

const contactRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/contact.component').then(m => m.ContactComponent),
    data: {},
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/contact-detail.component').then(m => m.ContactDetailComponent),
    resolve: {
      contact: ContactResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/contact-update.component').then(m => m.ContactUpdateComponent),
    resolve: {
      contact: ContactResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/contact-update.component').then(m => m.ContactUpdateComponent),
    resolve: {
      contact: ContactResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default contactRoute;
