import { Service, signal } from '@angular/core';
import { form, maxLength, required } from '@angular/forms/signals';

import { Category } from '../models/category';

const emptyCategory = (): Category => ({
    id: null,
    name: '',
    description: '',
    status: true
});

@Service({ autoProvided: false })
export class CategoryForm {

    readonly $model = signal<Category>(emptyCategory());

    readonly $form = form(this.$model, (path) => {
        required(path.name);
        maxLength(path.name, 100);

        maxLength(path.description, 255);
    });

    readonly isInvalid = () => this.$form().invalid();

    patch(category: Category) {
        this.$model.set(category);
    }

    value() {
        return this.$model();
    }

    reset() {
        this.$model.set(emptyCategory());
    }
}
