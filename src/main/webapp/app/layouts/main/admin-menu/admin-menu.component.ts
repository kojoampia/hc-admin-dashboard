import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'hpd-admin-menu',
  standalone: true,
  imports: [RouterModule, MatIconModule, MatButtonModule, MatMenuModule],
  templateUrl: './admin-menu.component.html',
})
export class AdminMenuComponent {
  readonly isOpen = signal(false);
}
