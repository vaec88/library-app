import { Service, signal } from '@angular/core';
import { form, maxLength, required } from '@angular/forms/signals';

import { Book } from '../models/book';

const emptyBook = (): Book => ({
    id: null,
    title: '',
    author: '',
    isbn: '',
    available: true,
    categoryId: null,
    categoryName: ''
});

@Service({ autoProvided: false })
export class BookForm {

    readonly $model = signal<Book>(emptyBook());

    readonly $form = form(this.$model, (path) => {
        required(path.title);
        maxLength(path.title, 200);

        required(path.author);
        maxLength(path.author, 150);

        maxLength(path.isbn, 13);

        required(path.categoryId);
    });

    readonly isInvalid = () => this.$form().invalid();

    patch(book: Book) {
        this.$model.set(book);
    }

    value() {
        return this.$model();
    }

    reset() {
        this.$model.set(emptyBook());
    }
}
