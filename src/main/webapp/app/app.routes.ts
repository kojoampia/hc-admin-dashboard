import { Routes } from '@angular/router';

import { Authority } from 'app/config/authority.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { errorRoute } from './layouts/error/error.route';

import HomeComponent from './home/home.component';
import LoginComponent from './login/login.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'home.title',
  },
  // The `navbar` outlet route that used to sit here is gone with the BridgeCare shell. It was
  // inert: no template in the app ever rendered a `<router-outlet name="navbar">`, so
  // NavbarComponent — and the entity menu it carried — never appeared on screen. That menu now
  // lives in the shell topbar (layouts/main/main.component.html), built from the same
  // EntityNavbarItems list.
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
  // NOTE ON PATHS: the screens below are the sidebar's hand-written surface and use PLURAL paths.
  // The generated CRUD reached from the entity navbar uses the singular ones and is registered in
  // entities/entity.routes.ts. That split is load-bearing: this array is matched before the
  // lazy-loaded children, so a hand-written screen sharing a path with a generated one wins and the
  // navbar link silently goes somewhere other than where it says. /dashboard, /duty-roster and
  // /pricing-plan all did exactly that.
  {
    path: 'dashboards',
    loadComponent: () => import('./entities/dashboard/dashboard-component').then(m => m.DashboardComponent),
    data: { authorities: [Authority.ADMIN, Authority.OPERATOR] },
    canActivate: [UserRouteAccessService],
    title: 'adminDashboardApp.hcAdminServiceDashboard.home.title',
  },
  {
    path: 'messages',
    loadComponent: () => import('./entities/message/message').then(m => m.MessageComponent),
    data: { authorities: [Authority.ADMIN, Authority.OPERATOR] },
    canActivate: [UserRouteAccessService],
    title: 'adminDashboardApp.hcAdminServiceMessage.home.title',
  },
  {
    path: 'duty-rosters',
    loadComponent: () => import('./entities/duty-roster/duty-roster').then(m => m.DutyRosterComponent),
    data: { authorities: [Authority.ADMIN, Authority.OPERATOR] },
    canActivate: [UserRouteAccessService],
    title: 'adminDashboardApp.hcAdminServiceDutyRoster.home.title',
  },
  {
    path: 'pricing-plans',
    loadComponent: () => import('./entities/pricing-plan/pricing-plan').then(m => m.PricingPlanComponent),
    data: { authorities: [Authority.ADMIN, Authority.OPERATOR] },
    canActivate: [UserRouteAccessService],
    title: 'adminDashboardApp.hcAdminServicePricingPlan.home.title',
  },
  {
    path: 'catalog',
    loadComponent: () => import('./entities/system-catalog/system-catalog').then(m => m.SystemCatalogComponent),
    data: { authorities: [Authority.ADMIN, Authority.OPERATOR] },
    canActivate: [UserRouteAccessService],
    title: 'adminDashboardApp.hcAdminServiceSystemCatalog.home.title',
  },
  {
    path: 'facilities',
    loadComponent: () => import('./entities/facility/facility').then(m => m.FacilityComponent),
    data: { authorities: [Authority.ADMIN, Authority.OPERATOR] },
    canActivate: [UserRouteAccessService],
    title: 'adminDashboardApp.facility.home.title',
  },
  {
    path: 'teams',
    loadComponent: () => import('./entities/team/team').then(m => m.TeamComponent),
    data: { authorities: [Authority.ADMIN, Authority.OPERATOR] },
    canActivate: [UserRouteAccessService],
    title: 'adminDashboardApp.team.home.title',
  },
  {
    path: 'profiles',
    loadComponent: () => import('./entities/profile/profile-component').then(m => m.ProfileComponent),
    data: { authorities: [Authority.ADMIN, Authority.OPERATOR] },
    canActivate: [UserRouteAccessService],
    title: 'adminDashboardApp.profile.home.title',
  },
  {
    path: '',
    loadChildren: () => import(`./entities/entity.routes`),
  },
  ...errorRoute,
];

export default routes;
