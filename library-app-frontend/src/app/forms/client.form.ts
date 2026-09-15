import { Service, signal } from '@angular/core';
import { email, form, maxLength, required } from '@angular/forms/signals';

import { Client } from '../models/client';

const emptyClient = (): Client => ({
    id: null,
    firstName: '',
    lastName: '',
    idNumber: '',
    email: ''
});

@Service({ autoProvided: false })
export class ClientForm {

    readonly $model = signal<Client>(emptyClient());

    readonly $form = form(this.$model, (path) => {
        required(path.firstName);
        maxLength(path.firstName, 100);

        required(path.lastName);
        maxLength(path.lastName, 100);

        required(path.idNumber);
        maxLength(path.idNumber, 10);

        required(path.email);
        email(path.email);
        maxLength(path.email, 150);
    });

    readonly isInvalid = () => this.$form().invalid();

    patch(client: Client) {
        this.$model.set(client);
    }

    value() {
        return this.$model();
    }

    reset() {
        this.$model.set(emptyClient());
    }
}
