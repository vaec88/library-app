import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormField, FormRoot } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { CategoryForm } from '../../../forms/category.form';
import { Category } from '../../../models/category';
import { CategoryService } from '../../../services/category.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { CategoryDialogStore } from '../../../store/category-dialog.store';

@Component({
  selector: 'app-category-dialog',
  imports: [
    FormRoot,
    FormField,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule
  ],
  providers: [CategoryForm, CategoryDialogStore],
  templateUrl: './category-dialog.component.html',
  styleUrl: './category-dialog.component.css'
})
export class CategoryDialogComponent {

  protected readonly categoryForm = inject(CategoryForm);
  private readonly categoryDialogStore = inject(CategoryDialogStore);
  private readonly categoryService = inject(CategoryService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<CategoryDialogComponent>);
  private readonly data = inject<{ id: number | null }>(MAT_DIALOG_DATA, { optional: true });

  protected readonly $id = signal<number | null>(this.data?.id ?? null);

  protected $isEdit = computed(() => this.$id() !== null);

  constructor() {
    this.categoryDialogStore.setId(this.$id());

    effect(() => {
      if (this.categoryDialogStore.categoryResource.hasValue()) {
        const category = this.categoryDialogStore.categoryResource.value();
        this.categoryForm.patch({ ...category });
      }
    });
  }

  operate() {
    if (this.categoryForm.isInvalid()) return;

    const isEdit = this.$isEdit();
    const id = this.$id();
    const category: Category = this.categoryForm.value();

    const operator$ = isEdit ? this.categoryService.update(id!, category) : this.categoryService.save(category);

    operator$.subscribe(() => {
      this.notificationService.notify(isEdit ? 'Updated' : 'Created');
      this.dialogRef.close(true);
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
