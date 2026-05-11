import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { HeartRateComponent } from './heart-rate.component';

describe('HeartRateComponent', () => {
  let component: HeartRateComponent;
  let fixture: ComponentFixture<HeartRateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeartRateComponent],
      providers: [NgbActiveModal],
    })
    .overrideTemplate(HeartRateComponent, '')
    .compileComponents();
    
    fixture = TestBed.createComponent(HeartRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
