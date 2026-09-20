import { ReservationDetail } from './reservation-detail';

export class Reservation {
    id: number | null = null;
    reservationDate: string | null = null;
    clientId: number | null = null;
    clientName: string = '';
    details: ReservationDetail[] = [];
}
