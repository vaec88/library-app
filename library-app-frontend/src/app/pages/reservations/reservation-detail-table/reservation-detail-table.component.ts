import { Component, computed, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { Book } from '../../../models/book';
import { ReservationDetail } from '../../../models/reservation-detail';

@Component({
  selector: 'app-reservation-detail-table',
  imports: [MatTableModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './reservation-detail-table.component.html',
  styleUrl: './reservation-detail-table.component.css'
})
export class ReservationDetailTableComponent {

  readonly $details = input.required<ReservationDetail[]>({ alias: 'details' });
  readonly $books = input<Book[]>([], { alias: 'books' });

  readonly detailsChange = output<ReservationDetail[]>();

  protected readonly $selectedBookId = signal<number | null>(null);

  /** Mirrors R3: a book already on the reservation cannot be picked again. */
  protected readonly $selectableBooks = computed(() => {
    const takenBookIds = this.$details().map((detail) => detail.bookId);
    return this.$books().filter((book) => !takenBookIds.includes(book.id));
  });

  protected displayedColumns: string[] = ['bookId', 'bookTitle', 'actions'];

  add() {
    const bookId = this.$selectedBookId();
    if (bookId === null) return;

    const book = this.$books().find((candidate) => candidate.id === bookId);
    if (!book || this.$details().some((detail) => detail.bookId === bookId)) return;

    this.detailsChange.emit([...this.$details(), { id: null, bookId, bookTitle: book.title }]);
    this.$selectedBookId.set(null);
  }

  remove(bookId: number | null) {
    this.detailsChange.emit(this.$details().filter((detail) => detail.bookId !== bookId));
  }

  select(bookId: number | null) {
    this.$selectedBookId.set(bookId);
  }
}
