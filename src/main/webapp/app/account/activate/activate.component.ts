import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { mergeMap } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { ActivateService } from './activate.service';

@Component({
  selector: 'hpd-activate',
  imports: [SharedModule, RouterModule, MatButtonModule, MatCardModule],
  templateUrl: './activate.component.html',
})
export default class ActivateComponent implements OnInit {
  error = false;
  success = false;

  constructor(
    private activateService: ActivateService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(mergeMap(params => this.activateService.get(params.key))).subscribe({
      next: () => (this.success = true),
      error: () => (this.error = true),
    });
  }
}
