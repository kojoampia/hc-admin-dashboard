import '@angular/compiler';

jest.mock('./home/home.component', () => ({
  __esModule: true,
  default: class HomeComponent {},
}));

jest.mock('./layouts/navbar/navbar.component', () => ({
  __esModule: true,
  default: class NavbarComponent {},
}));

jest.mock('./login/login.component', () => ({
  __esModule: true,
  default: class LoginComponent {},
}));

jest.mock('./layouts/error/error.route', () => ({
  errorRoute: [],
}));

import { Authority } from 'app/config/authority.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import adminRoutes from './admin/admin.routes';
import routes from './app.routes';

describe('App route configuration', () => {
  it('protects the admin area with the admin authority guard', () => {
    const adminRoute = routes.find(route => route.path === 'admin');

    expect(adminRoute).toBeDefined();
    expect(adminRoute?.data?.['authorities']).toEqual([Authority.ADMIN]);
    expect(adminRoute?.canActivate).toEqual([UserRouteAccessService]);
    expect(adminRoute?.loadChildren).toBeDefined();
  });

  it('exposes the admin dashboard under the guarded admin area', () => {
    const dashboardRoute = adminRoutes.find(route => route.path === 'dashboard');
    const adminRootRedirect = adminRoutes.find(route => route.path === '' && route.redirectTo === 'dashboard');

    expect(adminRootRedirect).toBeDefined();
    expect(dashboardRoute).toBeDefined();
    expect(dashboardRoute?.title).toBe('global.menu.admin.dashboard');
    expect(dashboardRoute?.loadComponent).toBeDefined();
  });
});
