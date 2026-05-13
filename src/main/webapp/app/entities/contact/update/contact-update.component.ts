import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IContact } from '../contact.model';
import { ContactService } from '../service/contact.service';
import { ContactFormGroup, ContactFormService } from './contact-form.service';

@Component({
  selector: 'hpd-contact-update',
  templateUrl: './contact-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class ContactUpdateComponent implements OnInit {
  isSaving = false;
  contact: IContact | null = null;

  protected contactService = inject(ContactService);
  protected contactFormService = inject(ContactFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ContactFormGroup = this.contactFormService.createContactFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ contact }) => {
      this.contact = contact;
      if (contact) {
        this.updateForm(contact);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const contact = this.contactFormService.getContact(this.editForm);
    if (contact.id !== null) {
      this.subscribeToSaveResponse(this.contactService.update(contact));
    } else {
      this.subscribeToSaveResponse(this.contactService.create(contact));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IContact>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(contact: IContact): void {
    this.contact = contact;
    this.contactFormService.resetForm(this.editForm, contact);
  }
}
