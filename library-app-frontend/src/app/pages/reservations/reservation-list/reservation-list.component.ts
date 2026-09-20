import { DatePipe } from '@angular/common';
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
import { Reservation } from '../../../models/reservation';
import { ReservationService } from '../../../services/reservation.service';
import { ReservationStore } from '../../../store/reservation.store';
import { ReservationDialogComponent } from '../reservation-dialog/reservation-dialog.component';

@Component({
  selector: 'app-reservation-list',
  imports: [MatTableModule, MatSortModule, MatPaginatorModule, MatButtonModule, MatIconModule, DatePipe],
  providers: [ReservationStore],
  templateUrl: './reservation-list.component.html',
  styleUrl: './reservation-list.component.css'
})
export class ReservationListComponent {

  private readonly reservationService = inject(ReservationService);
  private readonly reservationStore = inject(ReservationStore);
  private readonly dialog = inject(MatDialog);

  protected readonly dataSource = new MatTableDataSource<Reservation>();
  protected readonly $sort = viewChild(MatSort);
  private readonly snackBar = inject(MatSnackBar);
  private readonly notificationService = inject(NotificationService);

  protected $reservations = this.reservationStore.$reservations;
  protected $pageRequest = this.reservationStore.$pageRequest;
  protected $totalElements = this.reservationStore.$totalElements;

  protected displayedColumns: string[] = ['id', 'reservationDate', 'clientName', 'books', 'actions'];

  constructor() {
    this.setupTableEffect();
    this.setupNotificationEffect();
  }

  private setupTableEffect() {
    effect(() => {
      const data = this.$reservations();
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

  bookTitles(reservation: Reservation) {
    return (reservation.details ?? []).map((detail) => detail.bookTitle).join(', ');
  }

  openDialog(id: number | null) {
    this.dialog
      .open(ReservationDialogComponent, { width: '600px', data: { id } })
      .afterClosed()
      .pipe(filter((saved) => saved))
      .subscribe(() => this.reservationStore.reload());
  }

  delete(id: number) {
    this.dialog
      .open(ConfirmDialogComponent)
      .afterClosed()
      .pipe(
        filter((confirmed) => confirmed),
        switchMap(() => this.reservationService.delete(id)),
        tap(() => this.notificationService.notify('Deleted'))
      )
      .subscribe(() => this.reservationStore.reload());
  }

  changePage(event: PageEvent) {
    this.reservationStore.change(event.pageIndex, event.pageSize);
  }
}
