import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import SharedModule from 'app/shared/shared.module';
import { GatewayRoutesService } from './gateway-routes.service';
import { GatewayRoute } from './gateway-route.model';

@Component({
  selector: 'hpd-gateway',
  templateUrl: './gateway.component.html',
  providers: [GatewayRoutesService],
  imports: [SharedModule, MatButtonModule, MatCardModule, MatIconModule],
})
export default class GatewayComponent implements OnInit {
  gatewayRoutes: GatewayRoute[] = [];
  updatingRoutes = false;

  constructor(private gatewayRoutesService: GatewayRoutesService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.updatingRoutes = true;
    this.gatewayRoutesService.findAll().subscribe(gatewayRoutes => {
      this.gatewayRoutes = gatewayRoutes;
      this.updatingRoutes = false;
    });
  }
}
