import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { StateStorageService } from 'app/core/auth/state-storage.service';
import SharedModule from 'app/shared/shared.module';
import HasAnyAuthorityDirective from 'app/shared/auth/has-any-authority.directive';
import { VERSION } from 'app/app.constants';
import { LANGUAGES } from 'app/config/language.constants';
import { Account } from 'app/core/auth/account.model';
import { AccountService } from 'app/core/auth/account.service';
import { LoginService } from 'app/login/login.service';
import { ProfileService } from 'app/layouts/profiles/profile.service';
import { EntityNavbarItems } from 'app/entities/entity-navbar-items';
import ActiveMenuDirective from './active-menu.directive';
import NavbarItem from './navbar-item.model';

type MenuItem = NavbarItem & {
  icon: string;
  dataCy?: string;
};

@Component({
  selector: 'hpd-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  imports: [RouterModule, SharedModule, HasAnyAuthorityDirective, ActiveMenuDirective],
})
export default class NavbarComponent implements OnInit {
  inProduction?: boolean;
  isNavbarCollapsed = true;
  languages = LANGUAGES;
  openAPIEnabled?: boolean;
  version = '';
  account: Account | null = null;
  entitiesNavbarItems: NavbarItem[] = [];
  entityRoutes: string[] = [];
  readonly adminMenuItems: MenuItem[] = [
    { name: 'Gateway', route: '/admin/gateway', translationKey: 'global.menu.admin.gateway', icon: 'lan' },
    {
      name: 'User management',
      route: '/admin/user-management',
      translationKey: 'global.menu.admin.userManagement',
      icon: 'groups',
    },
    { name: 'Metrics', route: '/admin/metrics', translationKey: 'global.menu.admin.metrics', icon: 'monitoring' },
    { name: 'Health', route: '/admin/health', translationKey: 'global.menu.admin.health', icon: 'favorite' },
    {
      name: 'Configuration',
      route: '/admin/configuration',
      translationKey: 'global.menu.admin.configuration',
      icon: 'settings',
    },
    { name: 'Logs', route: '/admin/logs', translationKey: 'global.menu.admin.logs', icon: 'receipt_long' },
  ];
  readonly adminRoutes = this.adminMenuItems.map(item => item.route);
  readonly accountRoutes = ['/account/settings', '/account/password'];

  constructor(
    private loginService: LoginService,
    private translateService: TranslateService,
    private stateStorageService: StateStorageService,
    private accountService: AccountService,
    private profileService: ProfileService,
    private router: Router,
  ) {
    if (VERSION) {
      this.version = VERSION.toLowerCase().startsWith('v') ? VERSION : `v${VERSION}`;
    }
  }

  ngOnInit(): void {
    this.entitiesNavbarItems = EntityNavbarItems;
    this.entityRoutes = this.entitiesNavbarItems.map(item => item.route);
    this.profileService.getProfileInfo().subscribe(profileInfo => {
      this.inProduction = profileInfo.inProduction;
      this.openAPIEnabled = profileInfo.openAPIEnabled;
    });

    this.accountService.getAuthenticationState().subscribe(account => {
      this.account = account;
    });
  }

  changeLanguage(languageKey: string): void {
    this.collapseNavbar();
    this.stateStorageService.storeLocale(languageKey);
    this.translateService.use(languageKey);
  }

  collapseNavbar(): void {
    this.isNavbarCollapsed = true;
  }

  login(): void {
    this.collapseNavbar();
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.collapseNavbar();
    this.loginService.logout();
    this.router.navigate(['']);
  }

  toggleNavbar(): void {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  isRouteActive(route: string, exact = false): boolean {
    const currentUrl = this.router.url.split('?')[0]?.split('#')[0] ?? '';
    return exact ? currentUrl === route : currentUrl === route || currentUrl.startsWith(`${route}/`);
  }

  isAnyRouteActive(routes: readonly string[]): boolean {
    return routes.some(route => this.isRouteActive(route));
  }
}
