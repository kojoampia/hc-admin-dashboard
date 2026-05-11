import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { IStat } from 'app/entities/adminMS/stat/stat.model';
import { StatComponent } from 'app/entities/adminMS/stat/list/stat.component';

@Component({
    selector: 'hpd-temperature',
    imports: [StatComponent],
    templateUrl: './temperature.component.html',
    styleUrl: './temperature.component.scss'
})
export class TemperatureComponent implements OnInit, OnDestroy {
  public type = 'temperature';
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
