import { Routes } from '@angular/router';

import { Authority } from 'app/config/authority.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { errorRoute } from './layouts/error/error.route';

import HomeComponent from './home/home.component';
import NavbarComponent from './layouts/navbar/navbar.component';
import LoginComponent from './login/login.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'home.title',
  },
  {
    path: '',
    component: NavbarComponent,
    outlet: 'navbar',
  },
  {
    path: 'admin',
    data: {
      authorities: [Authority.ADMIN],
    },
    canActivate: [UserRouteAccessService],
    loadChildren: () => import('./admin/admin.routes'),
  },
  {
    path: 'account',
    loadChildren: () => import('./account/account.route'),
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'login.title',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./entities/dashboard/dashboard-component').then(m => m.DashboardComponent),
    canActivate: [UserRouteAccessService],
    title: 'adminDashboardApp.hcAdminServiceDashboard.home.title',
  },
  {
    path: 'messages',
    loadComponent: () => import('./entities/message/message').then(m => m.MessageComponent),
    canActivate: [UserRouteAccessService],
    title: 'adminDashboardApp.hcAdminServiceMessage.home.title',
  },
  {
    path: 'duty-roster',
    loadComponent: () => import('./entities/duty-roster/duty-roster').then(m => m.DutyRosterComponent),
    canActivate: [UserRouteAccessService],
    title: 'adminDashboardApp.hcAdminServiceDutyRoster.home.title',
  },
  {
    path: 'pricing-plan',
    loadComponent: () => import('./entities/pricing-plan/pricing-plan').then(m => m.PricingPlanComponent),
    canActivate: [UserRouteAccessService],
    title: 'adminDashboardApp.hcAdminServicePricingPlan.home.title',
  },
  {
    path: 'catalog',
    loadComponent: () => import('./entities/system-catalog/system-catalog').then(m => m.SystemCatalogComponent),
    canActivate: [UserRouteAccessService],
    title: 'adminDashboardApp.hcAdminServiceSystemCatalog.home.title',
  },
  {
    path: 'facilities',
    loadComponent: () => import('./entities/facility/facility').then(m => m.FacilityComponent),
    canActivate: [UserRouteAccessService],
    title: 'Facilities',
  },
  {
    path: 'teams',
    loadComponent: () => import('./entities/team/team').then(m => m.TeamComponent),
    canActivate: [UserRouteAccessService],
    title: 'Teams',
  },
  {
    path: 'profiles',
    loadComponent: () => import('./entities/profile/profile').then(m => m.ProfileComponent),
    canActivate: [UserRouteAccessService],
    title: 'Profiles',
  },
  {
    path: '',
    loadChildren: () => import(`./entities/entity.routes`),
  },
  ...errorRoute,
];

export default routes;
