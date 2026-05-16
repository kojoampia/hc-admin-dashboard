import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DashboardStateService, AppResource } from '../../../services/dashboard-state';

interface MenuItem {
  label: string;
  icon: string;
  path: string;
  resource: AppResource;
}

@Component({
  selector: 'hpd-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  readonly state = inject(DashboardStateService);

  readonly isExpanded = signal(true);

  readonly filteredMenuItems = computed(() =>
    this.menuItems.filter(item => this.state.canAccess(item.resource, 'READ')),
  );

  private readonly menuItems: MenuItem[] = [
    { label: 'DASHBOARD',   icon: 'dashboard',       path: '/',           resource: 'DASHBOARD'  },
    { label: 'MESSAGES',    icon: 'chat',             path: '/messages',   resource: 'MESSAGES'   },
    { label: 'DUTY ROSTER', icon: 'calendar_month',  path: '/roster',     resource: 'DUTY_ROSTER'},
    { label: 'PRICE PLANS', icon: 'subscriptions',   path: '/plans',      resource: 'PRICE_PLANS'},
    { label: 'CATALOG',     icon: 'auto_stories',    path: '/cms',        resource: 'CATALOG'    },
    { label: 'FACILITIES',  icon: 'local_hospital',  path: '/facilities', resource: 'FACILITIES' },
    { label: 'TEAMS',       icon: 'groups',          path: '/teams',      resource: 'TEAMS'      },
    { label: 'PROFILES',    icon: 'people',          path: '/profiles',   resource: 'PROFILES'   },
  ];

  toggleExpanded(): void {
    this.isExpanded.update(v => !v);
  }

  userInitials(): string {
    const name = this.state.currentUser().name;
    return name.slice(0, 2).toUpperCase();
  }
}
