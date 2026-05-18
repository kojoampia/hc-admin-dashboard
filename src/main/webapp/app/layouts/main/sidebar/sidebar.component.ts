import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { DashboardStateService, AppResource } from '../../../entities/dashboard/dashboard-state';
import { ChatMenuComponent } from '../chat-menu/chat-menu.component';
import { LanguageMenuComponent } from '../language-menu/language-menu.component';
import { SettingMenuComponent } from '../setting-menu/setting-menu.component';

interface MenuItem {
  label: string;
  icon: string;
  path: string;
  resource: AppResource;
}

@Component({
  selector: 'hpd-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule, MatMenuModule, MatDividerModule, ChatMenuComponent, LanguageMenuComponent, SettingMenuComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  readonly state = inject(DashboardStateService);

  readonly isExpanded = this.state.sidebarExpanded;

  readonly filteredMenuItems = computed(() =>
    this.menuItems.filter(item => this.state.canAccess(item.resource, 'READ')),
  );

  private readonly menuItems: MenuItem[] = [
    {label: 'DASHBOARD',   icon: 'dashboard',       path: '/dashboard',    resource: 'DASHBOARD'  },
    {label: 'MESSAGES',    icon: 'chat',            path: '/messages',     resource: 'MESSAGES'   },
    {label: 'DUTY ROSTER', icon: 'calendar_month',  path: '/duty-roster',  resource: 'DUTY_ROSTER'},
    {label: 'PRICE PLANS', icon: 'subscriptions',   path: '/pricing-plan', resource: 'PRICE_PLANS'},
    {label: 'CATALOG',     icon: 'auto_stories',    path: '/catalog',      resource: 'CATALOG'    },
    {label: 'FACILITIES',  icon: 'local_hospital',  path: '/facilities',   resource: 'FACILITIES' },
    {label: 'TEAMS',       icon: 'groups',          path: '/teams',        resource: 'TEAMS'      },
    {label: 'PROFILES',    icon: 'people',          path: '/profiles',     resource: 'PROFILES'   },
  ];

  toggleExpanded(): void {
    this.state.toggleSidebar();
  }

  userInitials(): string {
    const name = this.state.currentUser().name;
    return name.slice(0, 2).toUpperCase();
  }
}
