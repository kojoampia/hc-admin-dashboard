import { Component, OnInit, RendererFactory2, Renderer2, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { MatSidenavModule } from '@angular/material/sidenav';
import dayjs from 'dayjs/esm';

import { AccountService } from 'app/core/auth/account.service';
import { AppPageTitleStrategy } from 'app/app-page-title-strategy';
import { DashboardStateService } from 'app/entities/dashboard/dashboard-state';
import { SidebarComponent } from './sidebar/sidebar.component';
import FooterComponent from '../footer/footer.component';

@Component({
  selector: 'hpd-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  standalone: true,
  providers: [AppPageTitleStrategy],
  imports: [RouterOutlet, MatSidenavModule, SidebarComponent, FooterComponent],
})
export default class MainComponent implements OnInit {
  readonly state = inject(DashboardStateService);

  readonly isHandset = toSignal(
    inject(BreakpointObserver)
      .observe(Breakpoints.Handset)
      .pipe(map(result => result.matches)),
    { initialValue: false },
  );

  private readonly accountService = inject(AccountService);
  private readonly appPageTitleStrategy = inject(AppPageTitleStrategy);
  private readonly translateService = inject(TranslateService);
  private readonly router = inject(Router);
  private renderer: Renderer2;

  constructor(rootRenderer: RendererFactory2) {
    this.renderer = rootRenderer.createRenderer(document.querySelector('html'), null);
  }

  ngOnInit(): void {
    this.accountService.identity().subscribe();

    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      // The title is translated once, by the router's TitleStrategy on navigation. Without this it
      // keeps the previous language until the next navigation — appPageTitleStrategy was injected
      // for exactly this and then never called.
      this.appPageTitleStrategy.updateTitle(this.router.routerState.snapshot);
      dayjs.locale(event.lang);
      this.renderer.setAttribute(document.querySelector('html'), 'lang', event.lang);
    });
  }
}
