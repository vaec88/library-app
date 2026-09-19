import { httpResource } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';

import { Category } from '../models/category';
import { CategoryService } from '../services/category.service';
import { emptyPageResponse, PageResponse } from '../shared/models/page-response';

@Service({ autoProvided: false })
export class CategoryStore {

    private readonly categoryService = inject(CategoryService);

    readonly $pageRequest = signal({ page: 0, size: 5 });

    readonly categoryResource = httpResource<PageResponse<Category>>(
        () => ({
            url: this.categoryService.resourceUrl,
            params: {
                page: this.$pageRequest().page,
                size: this.$pageRequest().size
            }
        }),
        { defaultValue: emptyPageResponse<Category>() }
    );

    readonly $categories = computed(() => this.categoryResource.value().content);
    readonly $totalElements = computed(() => this.categoryResource.value().page.totalElements);
    readonly $loading = this.categoryResource.isLoading;
    readonly $error = this.categoryResource.error;

    change(page: number, size: number) {
        this.$pageRequest.set({ page, size });
    }

    reload() {
        this.categoryResource.reload();
    }
}
