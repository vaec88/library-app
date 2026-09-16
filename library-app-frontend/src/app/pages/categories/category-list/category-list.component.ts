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
import { Category } from '../../../models/category';
import { CategoryService } from '../../../services/category.service';
import { CategoryStore } from '../../../store/category.store';
import { CategoryDialogComponent } from '../category-dialog/category-dialog.component';

@Component({
  selector: 'app-category-list',
  imports: [MatTableModule, MatSortModule, MatPaginatorModule, MatButtonModule, MatIconModule],
  providers: [CategoryStore],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css'
})
export class CategoryListComponent {

  private readonly categoryService = inject(CategoryService);
  private readonly categoryStore = inject(CategoryStore);
  private readonly dialog = inject(MatDialog);

  protected readonly dataSource = new MatTableDataSource<Category>();
  protected readonly $paginator = viewChild(MatPaginator);
  protected readonly $sort = viewChild(MatSort);
  private readonly snackBar = inject(MatSnackBar);
  private readonly notificationService = inject(NotificationService);

  protected $categories = this.categoryStore.$categories;
  protected $totalElements = this.categoryStore.$totalElements;

  protected displayedColumns: string[] = ['id', 'name', 'description', 'status', 'actions'];

  constructor() {
    this.setupTableEffect();
    this.setupNotificationEffect();
  }

  private setupTableEffect() {
    effect(() => {
      const data = this.$categories();
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
      .open(CategoryDialogComponent, { width: '450px', data: { id } })
      .afterClosed()
      .pipe(filter((saved) => saved))
      .subscribe(() => this.categoryStore.reload());
  }

  delete(id: number) {
    this.dialog
      .open(ConfirmDialogComponent)
      .afterClosed()
      .pipe(
        filter((confirmed) => confirmed),
        switchMap(() => this.categoryService.delete(id)),
        tap(() => this.notificationService.notify('Deleted'))
      )
      .subscribe(() => this.categoryStore.reload());
  }
}
