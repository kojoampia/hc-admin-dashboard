import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import SystemHealthComponent from './system-health/system-health';
import UsageStatisticsComponent from './usage-statistics/usage-statistics';
import UserActivityComponent from './user-activity/user-activity';

type DashboardLink = {
  readonly title: string;
  readonly description: string;
  readonly route: string;
  readonly icon: string;
};

@Component({
  selector: 'hpd-admin-dashboard',
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    SharedModule,
    MatButtonModule,
    MatIconModule,
    UserActivityComponent,
    SystemHealthComponent,
    UsageStatisticsComponent,
  ],
})
export default class DashboardComponent {
  readonly adminLinks: DashboardLink[] = [
    {
      title: 'User management',
      description: 'Review accounts, activation state, and administrator access.',
      route: '/admin/user-management',
      icon: 'groups',
    },
    {
      title: 'Health',
      description: 'Inspect service components, dependencies, and availability.',
      route: '/admin/health',
      icon: 'favorite',
    },
    {
      title: 'Metrics',
      description: 'Analyze request volume, JVM activity, and service usage.',
      route: '/admin/metrics',
      icon: 'monitoring',
    },
    {
      title: 'Configuration',
      description: 'Check runtime configuration exposed by the admin API.',
      route: '/admin/configuration',
      icon: 'settings',
    },
    {
      title: 'Gateway',
      description: 'Monitor registered routes and upstream gateway services.',
      route: '/admin/gateway',
      icon: 'lan',
    },
    {
      title: 'Logs',
      description: 'Inspect runtime logs and troubleshoot operational issues.',
      route: '/admin/logs',
      icon: 'receipt_long',
    },
    {
      title: 'API docs',
      description: 'Open the administrative API reference and endpoint details.',
      route: '/admin/docs',
      icon: 'description',
    },
  ];
}
