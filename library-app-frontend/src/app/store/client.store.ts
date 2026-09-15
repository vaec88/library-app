import { httpResource } from '@angular/common/http';
import { computed, inject, Service } from '@angular/core';

import { Client } from '../models/client';
import { ClientService } from '../services/client.service';

@Service({ autoProvided: false })
export class ClientStore {

    private readonly clientService = inject(ClientService);

    readonly clientResource = httpResource<Client[]>(
        () => this.clientService.resourceUrl,
        { defaultValue: [] }
    );

    readonly $clients = computed(() => this.clientResource.value());
    readonly $totalElements = computed(() => this.clientResource.value().length);
    readonly $loading = this.clientResource.isLoading;
    readonly $error = this.clientResource.error;

    reload() {
        this.clientResource.reload();
    }
}
