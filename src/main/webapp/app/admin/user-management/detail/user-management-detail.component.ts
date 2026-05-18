import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';
import SharedModule from 'app/shared/shared.module';

import { User } from '../user-management.model';

@Component({
  selector: 'hpd-user-mgmt-detail',
  templateUrl: './user-management-detail.component.html',
  imports: [SharedModule, MatButtonModule, MatCardModule],
})
export default class UserManagementDetailComponent implements OnInit {
  user: User | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.data.subscribe(({ user }) => {
      this.user = user;
    });
  }
}
