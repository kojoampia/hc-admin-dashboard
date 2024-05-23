import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { StatComponent } from '../../entities/adminMS/stat/list/stat.component';

@Component({
  selector: 'jhi-allergy',
  standalone: true,
  imports: [StatComponent],
  templateUrl: './allergy.component.html',
  styleUrl: './allergy.component.scss',
})
export class AllergyComponent {
  public type = 'allergies';
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
