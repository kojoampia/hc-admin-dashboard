import { Component, DestroyRef, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { MatIconModule } from '@angular/material/icon';
import SharedModule from 'app/shared/shared.module';
import ActiveMenuDirective from 'app/shared/language/active-menu.directive';
import { LANGUAGES } from 'app/config/language.constants';
import { VERSION } from 'app/app.constants';
import { Account } from 'app/core/auth/account.model';
import { AccountService } from 'app/core/auth/account.service';
import { StateStorageService } from 'app/core/auth/state-storage.service';
import { LoginService } from 'app/login/login.service';
import { DashboardStateService } from 'app/entities/dashboard/dashboard-state';
import { SHELL_NAV_GROUPS, ShellNavGroup, ShellNavItem } from '../shell-navigation';

/**
 * BridgeCare shell sidebar: navy rail, grouped navigation, account tile at the foot.
 *
 * Below `lg` it slides in over a scrim and the shell's topbar toggle drives it; from `lg` up it is
 * a sticky full-height column. The previous version was a `mat-sidenav` that collapsed to an
 * 80px icon rail — that collapse is gone deliberately. It hid every label behind an icon on the
 * one viewport wide enough to show them, while on a phone the rail still ate 80px of a 375px
 * screen, so the narrow case (where space is actually scarce) was the case it helped least.
 */
@Component({
  selector: 'hpd-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, SharedModule, ActiveMenuDirective],
  templateUrl: './sidebar.component.html',
  host: { class: 'contents' },
})
export class SidebarComponent implements OnInit {
  /** Mobile drawer state, owned by the shell. */
  readonly open = input(false);
  readonly closeRequest = output<void>();

  readonly state = inject(DashboardStateService);
  readonly navGroups = SHELL_NAV_GROUPS;
  readonly languages = LANGUAGES;
  readonly version = VERSION ? (VERSION.toLowerCase().startsWith('v') ? VERSION : `v${VERSION}`) : '';

  readonly account = signal<Account | null>(null);

  readonly userInitials = computed(() => {
    const name = this.state.currentUser().name.trim();
    // Two initials from "Ada Lovelace", two leading characters from "admin".
    const [first, second] = name.split(/\s+/).filter(Boolean);
    const initials = first && second ? `${first.charAt(0)}${second.charAt(0)}` : name.slice(0, 2);
    return initials.toUpperCase();
  });

  private readonly accountService = inject(AccountService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);
  private readonly stateStorageService = inject(StateStorageService);
  private readonly translateService = inject(TranslateService);

  ngOnInit(): void {
    this.accountService
      .getAuthenticationState()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(account => this.account.set(account));
  }

  groupVisible(group: ShellNavGroup): boolean {
    if (group.requiresAuth && this.account() === null) {
      return false;
    }
    if (group.authorities && !this.accountService.hasAnyAuthority(group.authorities)) {
      return false;
    }
    return this.visibleItems(group).length > 0;
  }

  visibleItems(group: ShellNavGroup): ShellNavItem[] {
    return group.items.filter(item => {
      if (item.resource && !this.state.canAccess(item.resource, 'READ')) {
        return false;
      }
      return !item.authorities || this.accountService.hasAnyAuthority(item.authorities);
    });
  }

  requestClose(): void {
    this.closeRequest.emit();
  }

  changeLanguage(languageKey: string): void {
    this.stateStorageService.storeLocale(languageKey);
    this.translateService.use(languageKey);
  }

  login(): void {
    void this.router.navigate(['/login']);
  }

  logout(): void {
    this.loginService.logout();
    void this.router.navigate(['']);
  }
}
