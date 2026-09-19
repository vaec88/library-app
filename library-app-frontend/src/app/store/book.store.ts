import { httpResource } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';

import { Book } from '../models/book';
import { BookService } from '../services/book.service';
import { emptyPageResponse, PageResponse } from '../shared/models/page-response';

@Service({ autoProvided: false })
export class BookStore {

    private readonly bookService = inject(BookService);

    readonly $pageRequest = signal({ page: 0, size: 5 });

    readonly bookResource = httpResource<PageResponse<Book>>(
        () => ({
            url: this.bookService.resourceUrl,
            params: {
                page: this.$pageRequest().page,
                size: this.$pageRequest().size
            }
        }),
        { defaultValue: emptyPageResponse<Book>() }
    );

    readonly $books = computed(() => this.bookResource.value().content);
    readonly $totalElements = computed(() => this.bookResource.value().page.totalElements);
    readonly $loading = this.bookResource.isLoading;
    readonly $error = this.bookResource.error;

    change(page: number, size: number) {
        this.$pageRequest.set({ page, size });
    }

    reload() {
        this.bookResource.reload();
    }
}
