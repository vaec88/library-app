import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormField, FormRoot } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { BookForm } from '../../../forms/book.form';
import { Book } from '../../../models/book';
import { BookService } from '../../../services/book.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { BookDialogStore } from '../../../store/book-dialog.store';

@Component({
  selector: 'app-book-dialog',
  imports: [
    FormRoot,
    FormField,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule
  ],
  providers: [BookForm, BookDialogStore],
  templateUrl: './book-dialog.component.html',
  styleUrl: './book-dialog.component.css'
})
export class BookDialogComponent {

  protected readonly bookForm = inject(BookForm);
  protected readonly bookDialogStore = inject(BookDialogStore);
  private readonly bookService = inject(BookService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<BookDialogComponent>);
  private readonly data = inject<{ id: number | null }>(MAT_DIALOG_DATA, { optional: true });

  protected readonly $id = signal<number | null>(this.data?.id ?? null);

  protected $isEdit = computed(() => this.$id() !== null);

  protected $categories = this.bookDialogStore.$categories;

  constructor() {
    this.bookDialogStore.setId(this.$id());

    effect(() => {
      if (this.bookDialogStore.bookResource.hasValue()) {
        const book = this.bookDialogStore.bookResource.value();
        this.bookForm.patch({
          ...book,
          isbn: book.isbn ?? '',
          available: book.available ?? true,
          categoryName: book.categoryName ?? ''
        });
      }
    });
  }

  operate() {
    if (this.bookForm.isInvalid()) return;

    const isEdit = this.$isEdit();
    const id = this.$id();
    const book: Book = this.toPayload(this.bookForm.value());

    const operator$ = isEdit ? this.bookService.update(id!, book) : this.bookService.save(book);

    operator$.subscribe(() => {
      this.notificationService.notify(isEdit ? 'Updated' : 'Created');
      this.dialogRef.close(true);
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }

  private toPayload(book: Book): Book {
    const isbn = book.isbn?.trim();

    return {
      id: book.id,
      title: book.title.trim(),
      author: book.author.trim(),
      isbn: isbn ? isbn : null,
      available: book.available,
      categoryId: book.categoryId
    } as unknown as Book;
  }
}
