import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { StatComponent } from '../../entities/adminMS/stat/list/stat.component';

@Component({
    selector: 'hpd-allergy',
    imports: [StatComponent],
    templateUrl: './allergy.component.html',
    styleUrl: './allergy.component.scss'
})
export class AllergyComponent implements OnInit, OnDestroy {
  public type = 'allergies';
  private destroyed$ = new Subject<boolean>();

  constructor(private modal: NgbActiveModal) {}

  // ngOnInit intentionally omitted: no initialization logic required

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }

  close(): void {
    this.modal.dismiss();
  }
}
