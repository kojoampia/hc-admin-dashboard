import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { StatComponent } from '../..//entities/adminMS/stat/list/stat.component';
import { Subject } from 'rxjs';

@Component({
    selector: 'hpd-emergency',
    imports: [StatComponent],
    templateUrl: './emergency.component.html',
    styleUrl: './emergency.component.scss'
})
export class EmergencyComponent {
  public type = 'emergencies';
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
