import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Authority } from 'app/config/authority.constants';
import { Account } from 'app/core/auth/account.model';
import { AccountService } from 'app/core/auth/account.service';
import SharedModule from 'app/shared/shared.module';
import { UserManagementService } from '../user-management/service/user-management.service';
import { IAuthority, IUser } from '../user-management/user-management.model';

type ProtectedRoute = {
  label: string;
  route: string;
  description: string;
  accessGranted: boolean;
};

const ADMIN_ROUTES: Array<Pick<ProtectedRoute, 'label' | 'route' | 'description'>> = [
  { label: 'Dashboard', route: '/admin/dashboard', description: 'Operational overview and widgets.' },
  { label: 'User management', route: '/admin/user-management', description: 'Account management and role review.' },
  { label: 'Health', route: '/admin/health', description: 'Health checks and dependencies.' },
  { label: 'Metrics', route: '/admin/metrics', description: 'JHipster metrics and service traffic.' },
  { label: 'Configuration', route: '/admin/configuration', description: 'Runtime configuration inspection.' },
  { label: 'Logs', route: '/admin/logs', description: 'Operational logs and diagnostics.' },
  { label: 'Gateway', route: '/admin/gateway', description: 'Gateway route monitoring.' },
  { label: 'API docs', route: '/admin/docs', description: 'Administrative API reference.' },
];

@Component({
  selector: 'hpd-access-control',
  templateUrl: './access-control.html',
  styleUrl: './access-control.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, SharedModule, MatButtonModule, MatIconModule],
})
export default class AccessControlComponent implements OnInit {
  readonly requiredAuthority = Authority.ADMIN;

  isLoading = true;
  errorMessage = '';
  currentLogin = '';
  currentStatus = 'Unknown';
  currentAuthorities: IAuthority[] = [];
  availableAuthorities: IAuthority[] = [];
  currentHasAdminAccess = false;
  adminUserCount = 0;
  activeAdminUserCount = 0;
  totalManagedUsers = 0;
  protectedRoutes: ProtectedRoute[] = [];

  constructor(
    private accountService: AccountService,
    private userManagementService: UserManagementService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadAccessOverview();
  }

  adminCoveragePercentage(): number {
    if (this.totalManagedUsers === 0) {
      return 0;
    }

    return Math.round((this.adminUserCount / this.totalManagedUsers) * 1000) / 10;
  }

  statusBadgeClasses(accessGranted: boolean): string {
    return accessGranted ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200';
  }

  private loadAccessOverview(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      account: this.accountService.identity(),
      users: this.userManagementService.query({
        page: 0,
        size: 1000,
        sort: ['login,asc'],
      }),
      authorities: this.userManagementService.authorities(),
    }).subscribe({
      next: ({ account, users, authorities }) => {
        this.updateAccountSummary(account);
        this.updateUserCoverage(users);
        this.availableAuthorities = authorities;
        this.protectedRoutes = ADMIN_ROUTES.map(route => ({
          ...route,
          accessGranted: this.currentHasAdminAccess,
        }));
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage =
          error.status === 403
            ? 'You do not have access to review dashboard permissions.'
            : 'Unable to load dashboard access control data.';
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      },
    });
  }

  private updateAccountSummary(account: Account | null): void {
    this.currentLogin = account?.login ?? account?.email ?? 'Unknown';
    this.currentStatus = account?.activated ? 'Active' : 'Inactive';
    this.currentAuthorities = account?.authorities ?? [];
    // `.some` on the name, not `.includes` of a literal: authorities are IAuthority objects, and
    // includes() compares by reference, so a fresh literal never matches.
    // The cast is needed because IAuthority.name is a plain string, not the Authority enum.
    this.currentHasAdminAccess = this.currentAuthorities.some(authority => authority.name === (Authority.ADMIN as string));
  }

  private updateUserCoverage(response: HttpResponse<IUser[]>): void {
    const users = response.body ?? [];
    this.totalManagedUsers = this.resolveTotalUsers(response, users.length);
    this.adminUserCount = users.filter(user => user.authorities?.includes(Authority.ADMIN)).length;
    this.activeAdminUserCount = users.filter(user => user.activated && user.authorities?.includes(Authority.ADMIN)).length;
  }

  private resolveTotalUsers(response: HttpResponse<IUser[]>, usersLength: number): number {
    const totalCountHeader = Number(response.headers.get('X-Total-Count'));
    return Number.isFinite(totalCountHeader) && totalCountHeader > 0 ? totalCountHeader : usersLength;
  }
}
