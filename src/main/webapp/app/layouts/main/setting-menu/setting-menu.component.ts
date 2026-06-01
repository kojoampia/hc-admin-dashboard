import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { LoginService } from 'app/login/login.service';

@Component({
  selector: 'hpd-setting-menu',
  standalone: true,
  imports: [RouterModule, MatIconModule, MatButtonModule, MatMenuModule],
  templateUrl: './setting-menu.component.html',
})
export class SettingMenuComponent {}
