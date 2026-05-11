import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SugarComponent } from './sugar.component';

describe('SugarComponent', () => {
  let component: SugarComponent;
  let fixture: ComponentFixture<SugarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SugarComponent],
      providers: [NgbActiveModal],
    })
    .overrideTemplate(SugarComponent, '')
    .compileComponents();
    
    fixture = TestBed.createComponent(SugarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
