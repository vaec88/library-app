import { httpResource } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';

import { Reservation } from '../models/reservation';
import { ReservationService } from '../services/reservation.service';
import { emptyPageResponse, PageResponse } from '../shared/models/page-response';

@Service({ autoProvided: false })
export class ReservationStore {

    private readonly reservationService = inject(ReservationService);

    readonly $pageRequest = signal({ page: 0, size: 5 });

    readonly reservationResource = httpResource<PageResponse<Reservation>>(
        () => ({
            url: this.reservationService.resourceUrl,
            params: {
                page: this.$pageRequest().page,
                size: this.$pageRequest().size
            }
        }),
        { defaultValue: emptyPageResponse<Reservation>() }
    );

    readonly $reservations = computed(() => this.reservationResource.value().content);
    readonly $totalElements = computed(() => this.reservationResource.value().page.totalElements);
    readonly $loading = this.reservationResource.isLoading;
    readonly $error = this.reservationResource.error;

    change(page: number, size: number) {
        this.$pageRequest.set({ page, size });
    }

    reload() {
        this.reservationResource.reload();
    }
}
