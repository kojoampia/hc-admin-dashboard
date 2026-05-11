import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { StatComponent } from '../../entities/adminMS/stat/list/stat.component';
import { Subject } from 'rxjs';

@Component({
    selector: 'hpd-blood-pressure',
    imports: [StatComponent],
    templateUrl: './blood-pressure.component.html',
    styleUrl: './blood-pressure.component.scss'
})
export class BloodPressureComponent {
  public type = 'pressure';
  private destroyed$ = new Subject<boolean>();

  constructor(private modal: NgbActiveModal) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }

  close(): void {
    this.modal.dismiss();
  }
}
