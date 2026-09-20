import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormField, FormRoot } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ReservationForm } from '../../../forms/reservation.form';
import { Reservation } from '../../../models/reservation';
import { ReservationDetail } from '../../../models/reservation-detail';
import { ReservationService } from '../../../services/reservation.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ReservationDialogStore } from '../../../store/reservation-dialog.store';
import { ReservationDetailTableComponent } from '../reservation-detail-table/reservation-detail-table.component';

@Component({
  selector: 'app-reservation-dialog',
  imports: [
    FormRoot,
    FormField,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    ReservationDetailTableComponent
  ],
  providers: [ReservationForm, ReservationDialogStore],
  templateUrl: './reservation-dialog.component.html',
  styleUrl: './reservation-dialog.component.css'
})
export class ReservationDialogComponent {

  protected readonly reservationForm = inject(ReservationForm);
  protected readonly reservationDialogStore = inject(ReservationDialogStore);
  private readonly reservationService = inject(ReservationService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<ReservationDialogComponent>);
  private readonly data = inject<{ id: number | null }>(MAT_DIALOG_DATA, { optional: true });

  protected readonly $id = signal<number | null>(this.data?.id ?? null);

  protected $isEdit = computed(() => this.$id() !== null);

  protected $clients = this.reservationDialogStore.$clients;
  protected $books = this.reservationDialogStore.$books;
  protected $details = this.reservationForm.$details;

  constructor() {
    this.reservationDialogStore.setId(this.$id());

    effect(() => {
      if (this.reservationDialogStore.reservationResource.hasValue()) {
        const reservation = this.reservationDialogStore.reservationResource.value();
        this.reservationForm.patch({
          ...reservation,
          reservationDate: this.toInputDate(reservation.reservationDate),
          clientName: reservation.clientName ?? '',
          details: reservation.details ?? []
        });
      }
    });
  }

  changeDetails(details: ReservationDetail[]) {
    this.reservationForm.setDetails(details);
  }

  operate() {
    if (this.reservationForm.isInvalid()) return;

    const isEdit = this.$isEdit();
    const id = this.$id();
    const reservation: Reservation = this.toPayload(this.reservationForm.value());

    const operator$ = isEdit ? this.reservationService.update(id!, reservation) : this.reservationService.save(reservation);

    operator$.subscribe(() => {
      this.notificationService.notify(isEdit ? 'Updated' : 'Created');
      this.dialogRef.close(true);
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }

  /** `datetime-local` only understands `yyyy-MM-ddTHH:mm`; the API sends seconds and fractions. */
  private toInputDate(reservationDate: string | null): string | null {
    return reservationDate ? reservationDate.substring(0, 16) : null;
  }

  private toPayload(reservation: Reservation): Reservation {
    return {
      clientId: reservation.clientId,
      reservationDate: reservation.reservationDate ? reservation.reservationDate : null,
      details: reservation.details.map((detail) => ({ bookId: detail.bookId }))
    } as unknown as Reservation;
  }
}
