import { Component, effect, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { filter, switchMap, tap } from 'rxjs';

import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../shared/services/notification.service';
import { Book } from '../../../models/book';
import { BookService } from '../../../services/book.service';
import { BookStore } from '../../../store/book.store';
import { BookDialogComponent } from '../book-dialog/book-dialog.component';

@Component({
  selector: 'app-book-list',
  imports: [MatTableModule, MatSortModule, MatPaginatorModule, MatButtonModule, MatIconModule],
  providers: [BookStore],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.css'
})
export class BookListComponent {

  private readonly bookService = inject(BookService);
  private readonly bookStore = inject(BookStore);
  private readonly dialog = inject(MatDialog);

  protected readonly dataSource = new MatTableDataSource<Book>();
  protected readonly $sort = viewChild(MatSort);
  private readonly snackBar = inject(MatSnackBar);
  private readonly notificationService = inject(NotificationService);

  protected $books = this.bookStore.$books;
  protected $pageRequest = this.bookStore.$pageRequest;
  protected $totalElements = this.bookStore.$totalElements;

  protected displayedColumns: string[] = ['id', 'title', 'author', 'isbn', 'available', 'categoryName', 'actions'];

  constructor() {
    this.setupTableEffect();
    this.setupNotificationEffect();
  }

  private setupTableEffect() {
    effect(() => {
      const data = this.$books();
      const sort = this.$sort();

      this.dataSource.data = data;
      this.dataSource.sort = sort ?? null;
    });
  }

  private setupNotificationEffect() {
    effect(() => {
      const message = this.notificationService.$message();
      if (message) {
        this.snackBar.open(message, 'INFO', { duration: 3000, horizontalPosition: 'right', verticalPosition: 'top' });
        this.notificationService.clear();
      }
    });
  }

  openDialog(id: number | null) {
    this.dialog
      .open(BookDialogComponent, { width: '450px', data: { id } })
      .afterClosed()
      .pipe(filter((saved) => saved))
      .subscribe(() => this.bookStore.reload());
  }

  delete(id: number) {
    this.dialog
      .open(ConfirmDialogComponent)
      .afterClosed()
      .pipe(
        filter((confirmed) => confirmed),
        switchMap(() => this.bookService.delete(id)),
        tap(() => this.notificationService.notify('Deleted'))
      )
      .subscribe(() => this.bookStore.reload());
  }

  changePage(event: PageEvent) {
    this.bookStore.change(event.pageIndex, event.pageSize);
  }
}
