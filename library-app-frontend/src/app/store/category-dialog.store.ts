import { httpResource } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';

import { Category } from '../models/category';
import { CategoryService } from '../services/category.service';

@Service({ autoProvided: false })
export class CategoryDialogStore {

    private readonly categoryService = inject(CategoryService);
    readonly $id = signal<number | null>(null);

    private readonly $categoryRequest = computed(() => {
        const id = this.$id();
        return id ? `${this.categoryService.resourceUrl}/${id}` : undefined;
    });

    readonly categoryResource = httpResource<Category>(() => this.$categoryRequest());

    setId(id: number | null) {
        this.$id.set(id);
    }
}
