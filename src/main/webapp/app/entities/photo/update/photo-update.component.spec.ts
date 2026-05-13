import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { PhotoService } from '../service/photo.service';
import { IPhoto } from '../photo.model';
import { PhotoFormService } from './photo-form.service';

import { PhotoUpdateComponent } from './photo-update.component';

describe('Photo Management Update Component', () => {
  let comp: PhotoUpdateComponent;
  let fixture: ComponentFixture<PhotoUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let photoFormService: PhotoFormService;
  let photoService: PhotoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PhotoUpdateComponent],
      providers: [
        provideHttpClient(),
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(PhotoUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(PhotoUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    photoFormService = TestBed.inject(PhotoFormService);
    photoService = TestBed.inject(PhotoService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const photo: IPhoto = { id: 'f819c1e3-3bc5-4547-9ab3-b04db73c8353' };

      activatedRoute.data = of({ photo });
      comp.ngOnInit();

      expect(comp.photo).toEqual(photo);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPhoto>>();
      const photo = { id: '98245f00-1396-47a3-8ffb-40eeceec323c' };
      jest.spyOn(photoFormService, 'getPhoto').mockReturnValue(photo);
      jest.spyOn(photoService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ photo });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: photo }));
      saveSubject.complete();

      // THEN
      expect(photoFormService.getPhoto).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(photoService.update).toHaveBeenCalledWith(expect.objectContaining(photo));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPhoto>>();
      const photo = { id: '98245f00-1396-47a3-8ffb-40eeceec323c' };
      jest.spyOn(photoFormService, 'getPhoto').mockReturnValue({ id: null });
      jest.spyOn(photoService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ photo: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: photo }));
      saveSubject.complete();

      // THEN
      expect(photoFormService.getPhoto).toHaveBeenCalled();
      expect(photoService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPhoto>>();
      const photo = { id: '98245f00-1396-47a3-8ffb-40eeceec323c' };
      jest.spyOn(photoService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ photo });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(photoService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
