import { Component, Output, EventEmitter, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AccountService } from 'app/core/auth/account.service';
import { VERSION } from 'app/app.constants';
import { AdminMenuComponent } from '../admin-menu/admin-menu.component';
import { ChatMenuComponent } from '../chat-menu/chat-menu.component';
import { LanguageMenuComponent } from '../language-menu/language-menu.component';
import { SettingMenuComponent } from '../setting-menu/setting-menu.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'hdb-toolbar',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    AdminMenuComponent,
    ChatMenuComponent,
    LanguageMenuComponent,
    SettingMenuComponent,
  ],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
  @Output() sidenavToggle = new EventEmitter<void>();

  readonly version = VERSION ? (VERSION.toLowerCase().startsWith('v') ? VERSION : `v${VERSION}`) : '1.0.0';

  private readonly accountService = inject(AccountService);

  toggleSidenav(): void {
    this.sidenavToggle.emit();
  }

  hasAnyAuthority(authority: string | string[]): boolean {
    return this.accountService.hasAnyAuthority(authority);
  }
}
