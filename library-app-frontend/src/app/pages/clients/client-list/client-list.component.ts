import { Component, effect, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { filter, switchMap, tap } from 'rxjs';

import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../shared/services/notification.service';
import { Client } from '../../../models/client';
import { ClientService } from '../../../services/client.service';
import { ClientStore } from '../../../store/client.store';
import { ClientDialogComponent } from '../client-dialog/client-dialog.component';

@Component({
  selector: 'app-client-list',
  imports: [MatTableModule, MatSortModule, MatPaginatorModule, MatButtonModule, MatIconModule],
  providers: [ClientStore],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css'
})
export class ClientListComponent {

  private readonly clientService = inject(ClientService);
  private readonly clientStore = inject(ClientStore);
  private readonly dialog = inject(MatDialog);

  protected readonly dataSource = new MatTableDataSource<Client>();
  protected readonly $paginator = viewChild(MatPaginator);
  protected readonly $sort = viewChild(MatSort);
  private readonly snackBar = inject(MatSnackBar);
  private readonly notificationService = inject(NotificationService);

  protected $clients = this.clientStore.$clients;
  protected $totalElements = this.clientStore.$totalElements;

  protected displayedColumns: string[] = ['id', 'firstName', 'lastName', 'idNumber', 'email', 'actions'];

  constructor() {
    this.setupTableEffect();
    this.setupNotificationEffect();
  }

  private setupTableEffect() {
    effect(() => {
      const data = this.$clients();
      const sort = this.$sort();
      const paginator = this.$paginator();

      this.dataSource.data = data;
      this.dataSource.sort = sort ?? null;
      this.dataSource.paginator = paginator ?? null;
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
      .open(ClientDialogComponent, { width: '450px', data: { id } })
      .afterClosed()
      .pipe(filter((saved) => saved))
      .subscribe(() => this.clientStore.reload());
  }

  delete(id: number) {
    this.dialog
      .open(ConfirmDialogComponent)
      .afterClosed()
      .pipe(
        filter((confirmed) => confirmed),
        switchMap(() => this.clientService.delete(id)),
        tap(() => this.notificationService.notify('Deleted'))
      )
      .subscribe(() => this.clientStore.reload());
  }
}
