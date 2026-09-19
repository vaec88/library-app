import { httpResource } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';

import { Book } from '../models/book';
import { Category } from '../models/category';
import { BookService } from '../services/book.service';
import { CategoryService } from '../services/category.service';

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

    readonly categoryResource = httpResource<Category[]>(
        () => ({
            url: `${this.categoryService.resourceUrl}/status/true`
        }),
        { defaultValue: [] }
    );

    readonly $categories = computed(
        () => this.categoryResource.value()
    );

    setId(id: number | null) {
        this.$id.set(id);
    }
}
