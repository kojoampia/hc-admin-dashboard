import { Component, OnInit, RendererFactory2, Renderer2, ViewChild, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import dayjs from 'dayjs/esm';

import { AccountService } from 'app/core/auth/account.service';
import { AppPageTitleStrategy } from 'app/app-page-title-strategy';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ToolbarComponent } from './toolbar/toolbar.component';

@Component({
  selector: 'hpd-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  standalone: true,
  providers: [AppPageTitleStrategy],
  imports: [RouterOutlet, MatSidenavModule, SidebarComponent, ToolbarComponent],
})
export default class MainComponent implements OnInit {
  @ViewChild('mainSidebar') mainSidebar?: MatSidenav;

  readonly isHandset = toSignal(
    inject(BreakpointObserver)
      .observe(Breakpoints.Handset)
      .pipe(map(result => result.matches)),
    { initialValue: false },
  );

  private readonly accountService = inject(AccountService);
  private readonly appPageTitleStrategy = inject(AppPageTitleStrategy);
  private readonly translateService = inject(TranslateService);
  private renderer: Renderer2;

  constructor(rootRenderer: RendererFactory2) {
    this.renderer = rootRenderer.createRenderer(document.querySelector('html'), null);
  }

  ngOnInit(): void {
    this.accountService.identity().subscribe();

    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      dayjs.locale(event.lang);
      this.renderer.setAttribute(document.querySelector('html'), 'lang', event.lang);
    });
  }

}
