import { computed, Service, signal } from '@angular/core';
import { form, required } from '@angular/forms/signals';

import { Reservation } from '../models/reservation';
import { ReservationDetail } from '../models/reservation-detail';

const emptyReservation = (): Reservation => ({
    id: null,
    reservationDate: null,
    clientId: null,
    clientName: '',
    details: []
});

@Service({ autoProvided: false })
export class ReservationForm {

    readonly $model = signal<Reservation>(emptyReservation());

    readonly $form = form(this.$model, (path) => {
        required(path.clientId);
    });

    readonly $details = computed(() => this.$model().details);

    readonly isInvalid = () => this.$form().invalid() || this.$model().details.length === 0;

    patch(reservation: Reservation) {
        this.$model.set(reservation);
    }

    setDetails(details: ReservationDetail[]) {
        this.$model.update((reservation) => ({ ...reservation, details }));
    }

    value() {
        return this.$model();
    }

    reset() {
        this.$model.set(emptyReservation());
    }
}
