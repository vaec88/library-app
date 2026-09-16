import { httpResource } from '@angular/common/http';
import { computed, inject, Service } from '@angular/core';

import { Category } from '../models/category';
import { CategoryService } from '../services/category.service';

@Service({ autoProvided: false })
export class CategoryStore {

    private readonly categoryService = inject(CategoryService);

    readonly categoryResource = httpResource<Category[]>(
        () => this.categoryService.resourceUrl,
        { defaultValue: [] }
    );

    readonly $categories = computed(() => this.categoryResource.value());
    readonly $totalElements = computed(() => this.categoryResource.value().length);
    readonly $loading = this.categoryResource.isLoading;
    readonly $error = this.categoryResource.error;

    reload() {
        this.categoryResource.reload();
    }
}
