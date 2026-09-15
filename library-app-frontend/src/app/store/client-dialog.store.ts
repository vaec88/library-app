import { httpResource } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';

import { Client } from '../models/client';
import { ClientService } from '../services/client.service';

@Service({ autoProvided: false })
export class ClientDialogStore {

    private readonly clientService = inject(ClientService);
    readonly $id = signal<number | null>(null);

    private readonly $clientRequest = computed(() => {
        const id = this.$id();
        return id ? `${this.clientService.resourceUrl}/${id}` : undefined;
    });

    readonly clientResource = httpResource<Client>(() => this.$clientRequest());

    setId(id: number | null) {
        this.$id.set(id);
    }
}
