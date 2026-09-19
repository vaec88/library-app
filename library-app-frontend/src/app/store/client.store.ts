import { httpResource } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';

import { Client } from '../models/client';
import { ClientService } from '../services/client.service';
import { emptyPageResponse, PageResponse } from '../shared/models/page-response';

@Service({ autoProvided: false })
export class ClientStore {

    private readonly clientService = inject(ClientService);

    readonly $pageRequest = signal({ page: 0, size: 5 });

    readonly clientResource = httpResource<PageResponse<Client>>(
        () => ({
            url: this.clientService.resourceUrl,
            params: {
                page: this.$pageRequest().page,
                size: this.$pageRequest().size
            }
        }),
        { defaultValue: emptyPageResponse<Client>() }
    );

    readonly $clients = computed(() => this.clientResource.value().content);
    readonly $totalElements = computed(() => this.clientResource.value().page.totalElements);
    readonly $loading = this.clientResource.isLoading;
    readonly $error = this.clientResource.error;

    change(page: number, size: number) {
        this.$pageRequest.set({ page, size });
    }

    reload() {
        this.clientResource.reload();
    }
}
