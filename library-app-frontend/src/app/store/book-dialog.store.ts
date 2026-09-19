import { httpResource } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';

import { Book } from '../models/book';
import { Category } from '../models/category';
import { BookService } from '../services/book.service';
import { CategoryService } from '../services/category.service';
import { emptyPageResponse, PageResponse } from '../shared/models/page-response';

@Service({ autoProvided: false })
export class BookDialogStore {

    private readonly bookService = inject(BookService);
    private readonly categoryService = inject(CategoryService);

    readonly $id = signal<number | null>(null);

    private readonly $bookRequest = computed(() => {
        const id = this.$id();
        return id ? `${this.bookService.resourceUrl}/${id}` : undefined;
    });

    readonly bookResource = httpResource<Book>(() => this.$bookRequest());

    readonly categoryResource = httpResource<PageResponse<Category>>(
        () => ({
            url: this.categoryService.resourceUrl,
            params: { page: 0, size: 100 }
        }),
        { defaultValue: emptyPageResponse<Category>() }
    );

    readonly $categories = computed(
        () => this.categoryResource.value().content.filter((category) => category.status)
    );

    setId(id: number | null) {
        this.$id.set(id);
    }
}
