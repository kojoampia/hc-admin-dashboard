import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

import { NgxChartsModule } from '@swimlane/ngx-charts';
import SharedModule from 'app/shared/shared.module';
import { IUser } from '../user-management/user-management.model';
import { UserManagementService } from '../user-management/service/user-management.service';

type ChartDatum = {
  name: string;
  value: number;
};

@Component({
  selector: 'hpd-user-activity',
  templateUrl: './user-activity.html',
  styleUrl: './user-activity.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, SharedModule, MatButtonModule, MatIconModule, NgxChartsModule],
})
export default class UserActivityComponent implements OnInit {
  private userManagementService = inject(UserManagementService);

  isLoading = true;
  errorMessage = '';
  totalUsers = 0;
  activeUsers = 0;
  inactiveUsers = 0;
  adminUsers = 0;
  recentUsers = 0;
  userStatusData: ChartDatum[] = [];

  ngOnInit(): void {
    this.loadUserActivity();
  }

  private loadUserActivity(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userManagementService
      .query({
        page: 0,
        size: 1000,
        sort: ['createdDate,desc'],
      })
      .subscribe({
        next: (response: HttpResponse<IUser[]>) => {
          this.updateMetrics(response);
          this.isLoading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.status === 403 ? 'You do not have access to user activity data.' : 'Unable to load user activity.';
          this.isLoading = false;
        },
      });
  }

  private updateMetrics(response: HttpResponse<IUser[]>): void {
    const users = response.body ?? [];
    const totalCountHeader = Number(response.headers.get('X-Total-Count'));
    const totalUsers = Number.isFinite(totalCountHeader) && totalCountHeader > 0 ? totalCountHeader : users.length;
    const activeUsers = users.filter(user => user.activated).length;
    const adminUsers = users.filter(user => user.authorities?.includes('ROLE_ADMIN')).length;
    const recentUsers = users.filter(user => this.isRecentlyCreated(user.createdDate)).length;

    this.totalUsers = totalUsers;
    this.activeUsers = activeUsers;
    this.inactiveUsers = Math.max(totalUsers - activeUsers, 0);
    this.adminUsers = adminUsers;
    this.recentUsers = recentUsers;
    this.userStatusData = [
      { name: 'Active users', value: activeUsers },
      { name: 'Inactive users', value: this.inactiveUsers },
    ];
  }

  private isRecentlyCreated(createdDate: IUser['createdDate']): boolean {
    if (!createdDate) {
      return false;
    }

    const createdTime = new Date(createdDate).getTime();
    if (Number.isNaN(createdTime)) {
      return false;
    }

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return createdTime >= thirtyDaysAgo;
  }
}
