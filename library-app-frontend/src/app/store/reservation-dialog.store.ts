import { httpResource } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';

import { Book } from '../models/book';
import { Client } from '../models/client';
import { Reservation } from '../models/reservation';
import { BookService } from '../services/book.service';
import { ClientService } from '../services/client.service';
import { ReservationService } from '../services/reservation.service';
import { emptyPageResponse, PageResponse } from '../shared/models/page-response';

@Service({ autoProvided: false })
export class ReservationDialogStore {

    private readonly reservationService = inject(ReservationService);
    private readonly clientService = inject(ClientService);
    private readonly bookService = inject(BookService);

    readonly $id = signal<number | null>(null);

    private readonly $reservationRequest = computed(() => {
        const id = this.$id();
        return id ? `${this.reservationService.resourceUrl}/${id}` : undefined;
    });

    readonly reservationResource = httpResource<Reservation>(() => this.$reservationRequest());

    readonly clientResource = httpResource<PageResponse<Client>>(
        () => ({
            url: this.clientService.resourceUrl,
            params: { page: 0, size: 100 }
        }),
        { defaultValue: emptyPageResponse<Client>() }
    );

    readonly bookResource = httpResource<Book[]>(
        () => ({
            url: `${this.bookService.resourceUrl}/available/true`
        }),
        { defaultValue: [] }
    );

    readonly $clients = computed(() => this.clientResource.value().content);

    /**
     * The books already on the reservation are `available = false`, so the lookup does not return
     * them. They are merged back in, otherwise editing a reservation would drop its own books.
     */
    readonly $books = computed(() => {
        const books = [...this.bookResource.value()];
        const reservation = this.reservationResource.hasValue() ? this.reservationResource.value() : null;

        for (const detail of reservation?.details ?? []) {
            if (detail.bookId === null || books.some((book) => book.id === detail.bookId)) continue;

            books.push({
                id: detail.bookId,
                title: detail.bookTitle,
                author: '',
                isbn: '',
                available: false,
                categoryId: null,
                categoryName: ''
            });
        }

        return books;
    });

    setId(id: number | null) {
        this.$id.set(id);
    }
}
