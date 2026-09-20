import { DatePipe } from '@angular/common';
import { Component, effect, inject, viewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { Reservation } from '../../../models/reservation';
import { ClientReservationStore } from '../../../store/client-reservation.store';

@Component({
  selector: 'app-client-reservations',
  imports: [MatTableModule, MatSortModule, MatPaginatorModule, MatFormFieldModule, MatSelectModule, DatePipe],
  providers: [ClientReservationStore],
  templateUrl: './client-reservations.component.html',
  styleUrl: './client-reservations.component.css'
})
export class ClientReservationsComponent {

  private readonly clientReservationStore = inject(ClientReservationStore);

  protected readonly dataSource = new MatTableDataSource<Reservation>();
  protected readonly $sort = viewChild(MatSort);

  protected $clients = this.clientReservationStore.$clients;
  protected $clientId = this.clientReservationStore.$clientId;
  protected $reservations = this.clientReservationStore.$reservations;
  protected $pageRequest = this.clientReservationStore.$pageRequest;
  protected $totalElements = this.clientReservationStore.$totalElements;

  protected displayedColumns: string[] = ['id', 'reservationDate', 'books'];

  constructor() {
    effect(() => {
      const data = this.$reservations();
      const sort = this.$sort();

      this.dataSource.data = data;
      this.dataSource.sort = sort ?? null;
    });
  }

  bookTitles(reservation: Reservation) {
    return (reservation.details ?? []).map((detail) => detail.bookTitle).join(', ');
  }

  selectClient(clientId: number | null) {
    this.clientReservationStore.setClientId(clientId);
  }

  changePage(event: PageEvent) {
    this.clientReservationStore.change(event.pageIndex, event.pageSize);
  }
}
