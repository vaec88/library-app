import { Service } from '@angular/core';

import { environment } from '../../environments/environment';
import { Reservation } from '../models/reservation';
import { GenericService } from './generic.service';

@Service()
export class ReservationService extends GenericService<Reservation> {

    protected override url = `${environment.HOST}/v1/reservations`;

    clientResourceUrl(clientId: number) {
        return `${this.url}/client/${clientId}`;
    }
}
