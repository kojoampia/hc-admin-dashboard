import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import AuditLogResolve from './route/audit-log-routing-resolve.service';

const auditLogRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/audit-log.component').then(m => m.AuditLogComponent),
    data: { authorities: ['ROLE_ADMIN', 'ROLE_OPERATOR'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/audit-log-detail.component').then(m => m.AuditLogDetailComponent),
    resolve: {
      auditLog: AuditLogResolve,
    },
    data: { authorities: ['ROLE_ADMIN', 'ROLE_OPERATOR'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/audit-log-update.component').then(m => m.AuditLogUpdateComponent),
    resolve: {
      auditLog: AuditLogResolve,
    },
    data: { authorities: ['ROLE_ADMIN'] },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/audit-log-update.component').then(m => m.AuditLogUpdateComponent),
    resolve: {
      auditLog: AuditLogResolve,
    },
    data: { authorities: ['ROLE_ADMIN'] },
    canActivate: [UserRouteAccessService],
  },
];

export default auditLogRoute;
