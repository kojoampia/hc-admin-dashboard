import { Component, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { StatComponent } from 'app/entities/adminMS/stat/list/stat.component';
import { Subject } from 'rxjs';

@Component({
    selector: 'hpd-sugar',
    imports: [StatComponent],
    templateUrl: './sugar.component.html',
    styleUrl: './sugar.component.scss'
})
export class SugarComponent implements OnDestroy {
  public type = 'sugar';
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
