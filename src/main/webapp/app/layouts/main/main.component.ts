import { Component, HostListener, OnInit, RendererFactory2, Renderer2, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import dayjs from 'dayjs/esm';

import { Authority } from 'app/config/authority.constants';
import { AccountService } from 'app/core/auth/account.service';
import { AppPageTitleStrategy } from 'app/app-page-title-strategy';
import { EntityNavbarItems } from 'app/entities/entity-navbar-items';
import SharedModule from 'app/shared/shared.module';
import { SidebarComponent } from './sidebar/sidebar.component';
import FooterComponent from '../footer/footer.component';
import { findShellNavGroup } from './shell-navigation';

/**
 * BridgeCare shell: navy sidebar, sticky cream topbar, content column, footer.
 *
 * This replaced a `mat-sidenav-container` whose only chrome was the sidebar — there was no topbar,
 * so no screen announced what it was beyond the browser tab, and the entity CRUD had no entry
 * point at all (app.routes.ts registers `NavbarComponent` on a `navbar` outlet that the old
 * template never rendered, so the generated screens were reachable only by typing the URL). The
 * topbar's entity menu is that surface, restored.
 */
@Component({
  selector: 'hpd-main',
  templateUrl: './main.component.html',
  standalone: true,
  providers: [AppPageTitleStrategy],
  imports: [RouterModule, SharedModule, MatIconModule, MatMenuModule, SidebarComponent, FooterComponent],
})
export default class MainComponent implements OnInit {
  sidebarOpen = false;
  crumbKey: string | null = null;
  titleKey = 'global.title';
  authenticated = false;
  canBrowseEntities = false;

  readonly entityNavbarItems = EntityNavbarItems;

  private readonly accountService = inject(AccountService);
  private readonly appPageTitleStrategy = inject(AppPageTitleStrategy);
  private readonly translateService = inject(TranslateService);
  private readonly router = inject(Router);
  private renderer: Renderer2;

  constructor() {
    const rootRenderer = inject(RendererFactory2);

    this.renderer = rootRenderer.createRenderer(document.querySelector('html'), null);
  }

  ngOnInit(): void {
    this.accountService.identity().subscribe();

    this.accountService.getAuthenticationState().subscribe(account => {
      this.authenticated = account !== null;
      // The api's /api/** chain is a read/write split: ADMIN everything, OPERATOR GET, plain USER
      // nothing. Offering the entity menu to a bare USER would only ever produce 403s.
      this.canBrowseEntities = this.accountService.hasAnyAuthority([Authority.ADMIN, Authority.OPERATOR]);
      this.syncPageHeader();
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.sidebarOpen = false;
        this.syncPageHeader();
      }
    });

    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      // The title is translated once, by the router's TitleStrategy on navigation. Without this it
      // keeps the previous language until the next navigation — appPageTitleStrategy was injected
      // for exactly this and then never called.
      this.appPageTitleStrategy.updateTitle(this.router.routerState.snapshot);
      dayjs.locale(event.lang);
      this.renderer.setAttribute(document.querySelector('html'), 'lang', event.lang);
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeSidebar();
  }

  /**
   * Topbar crumb + title. The title is the route's own `title` — every route in app.routes.ts
   * declares one, and it is already the translated string the browser tab uses, so the header and
   * the tab can never disagree. The crumb is the sidebar group the active route sits in.
   */
  private syncPageHeader(): void {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    const routeTitle = typeof route.routeConfig?.title === 'string' ? route.routeConfig.title : null;
    this.crumbKey = findShellNavGroup(this.router.url)?.labelKey ?? null;
    this.titleKey = routeTitle ?? 'global.title';
  }
}
