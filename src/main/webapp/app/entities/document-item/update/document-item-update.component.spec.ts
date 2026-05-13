import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { DocumentItemService } from '../service/document-item.service';
import { IDocumentItem } from '../document-item.model';
import { DocumentItemFormService } from './document-item-form.service';

import { DocumentItemUpdateComponent } from './document-item-update.component';

describe('DocumentItem Management Update Component', () => {
  let comp: DocumentItemUpdateComponent;
  let fixture: ComponentFixture<DocumentItemUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let documentItemFormService: DocumentItemFormService;
  let documentItemService: DocumentItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DocumentItemUpdateComponent],
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
      .overrideTemplate(DocumentItemUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(DocumentItemUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    documentItemFormService = TestBed.inject(DocumentItemFormService);
    documentItemService = TestBed.inject(DocumentItemService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const documentItem: IDocumentItem = { id: 'cfa4c7b0-9f84-4331-adc1-0bdbb322db25' };

      activatedRoute.data = of({ documentItem });
      comp.ngOnInit();

      expect(comp.documentItem).toEqual(documentItem);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDocumentItem>>();
      const documentItem = { id: 'c9e66bb6-6638-42c5-a4fc-dc0f4f51794f' };
      jest.spyOn(documentItemFormService, 'getDocumentItem').mockReturnValue(documentItem);
      jest.spyOn(documentItemService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ documentItem });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: documentItem }));
      saveSubject.complete();

      // THEN
      expect(documentItemFormService.getDocumentItem).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(documentItemService.update).toHaveBeenCalledWith(expect.objectContaining(documentItem));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDocumentItem>>();
      const documentItem = { id: 'c9e66bb6-6638-42c5-a4fc-dc0f4f51794f' };
      jest.spyOn(documentItemFormService, 'getDocumentItem').mockReturnValue({ id: null });
      jest.spyOn(documentItemService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ documentItem: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: documentItem }));
      saveSubject.complete();

      // THEN
      expect(documentItemFormService.getDocumentItem).toHaveBeenCalled();
      expect(documentItemService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDocumentItem>>();
      const documentItem = { id: 'c9e66bb6-6638-42c5-a4fc-dc0f4f51794f' };
      jest.spyOn(documentItemService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ documentItem });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(documentItemService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
