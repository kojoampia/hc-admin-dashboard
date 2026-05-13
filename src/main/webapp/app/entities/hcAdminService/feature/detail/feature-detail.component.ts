import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IFeature } from '../feature.model';

@Component({
  selector: 'hpd-feature-detail',
  templateUrl: './feature-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class FeatureDetailComponent {
  feature = input<IFeature | null>(null);

  previousState(): void {
    window.history.back();
  }
}
