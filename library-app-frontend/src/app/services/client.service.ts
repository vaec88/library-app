import { Service } from '@angular/core';

import { environment } from '../../environments/environment';
import { Client } from '../models/client';
import { GenericService } from './generic.service';

@Service()
export class ClientService extends GenericService<Client> {

    protected override url = `${environment.HOST}/v1/clients`;
}
