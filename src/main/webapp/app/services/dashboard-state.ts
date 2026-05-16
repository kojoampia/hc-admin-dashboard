import { Injectable, signal, computed } from '@angular/core';

export type AppResource =
  | 'DASHBOARD'
  | 'MESSAGES'
  | 'DUTY_ROSTER'
  | 'PRICE_PLANS'
  | 'CATALOG'
  | 'FACILITIES'
  | 'TEAMS'
  | 'PROFILES';

export type Permission = 'READ' | 'WRITE' | 'DELETE';

export interface AppUser {
  name: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardStateService {
  readonly currentUser = signal<AppUser>({ name: 'Guest', role: 'USER' });

  readonly menu = computed(() => this.activeMenu());

  private readonly activeMenu = signal<string>('DASHBOARD');

  setMenu(label: string): void {
    this.activeMenu.set(label);
  }

  setUser(user: AppUser): void {
    this.currentUser.set(user);
  }

  canAccess(resource: AppResource, permission: Permission): boolean {
    const role = this.currentUser().role;
    if (role === 'ADMIN') {
      return true;
    }
    // Default: all authenticated users can READ all resources
    if (permission === 'READ') {
      return true;
    }
    return false;
  }
}
