import { httpResource } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';

import { Client } from '../models/client';
import { Reservation } from '../models/reservation';
import { ClientService } from '../services/client.service';
import { ReservationService } from '../services/reservation.service';
import { emptyPageResponse, PageResponse } from '../shared/models/page-response';

@Service({ autoProvided: false })
export class ClientReservationStore {

    private readonly reservationService = inject(ReservationService);
    private readonly clientService = inject(ClientService);

    readonly $clientId = signal<number | null>(null);
    readonly $pageRequest = signal({ page: 0, size: 5 });

    readonly clientResource = httpResource<PageResponse<Client>>(
        () => ({
            url: this.clientService.resourceUrl,
            params: { page: 0, size: 100 }
        }),
        { defaultValue: emptyPageResponse<Client>() }
    );

    readonly reservationResource = httpResource<PageResponse<Reservation>>(
        () => {
            const clientId = this.$clientId();
            if (clientId === null) return undefined;

            return {
                url: this.reservationService.clientResourceUrl(clientId),
                params: {
                    page: this.$pageRequest().page,
                    size: this.$pageRequest().size
                }
            };
        },
        { defaultValue: emptyPageResponse<Reservation>() }
    );

    readonly $clients = computed(() => this.clientResource.value().content);
    readonly $reservations = computed(() => this.reservationResource.value().content);
    readonly $totalElements = computed(() => this.reservationResource.value().page.totalElements);
    readonly $loading = this.reservationResource.isLoading;
    readonly $error = this.reservationResource.error;

    setClientId(clientId: number | null) {
        this.$clientId.set(clientId);
        this.$pageRequest.update((pageRequest) => ({ page: 0, size: pageRequest.size }));
    }

    change(page: number, size: number) {
        this.$pageRequest.set({ page, size });
    }
}
