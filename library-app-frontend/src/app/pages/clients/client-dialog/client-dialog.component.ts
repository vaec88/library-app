import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormField, FormRoot } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { ClientForm } from '../../../forms/client.form';
import { Client } from '../../../models/client';
import { ClientService } from '../../../services/client.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ClientDialogStore } from '../../../store/client-dialog.store';

@Component({
  selector: 'app-client-dialog',
  imports: [
    FormRoot,
    FormField,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  providers: [ClientForm, ClientDialogStore],
  templateUrl: './client-dialog.component.html',
  styleUrl: './client-dialog.component.css'
})
export class ClientDialogComponent {

  protected readonly clientForm = inject(ClientForm);
  private readonly clientDialogStore = inject(ClientDialogStore);
  private readonly clientService = inject(ClientService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<ClientDialogComponent>);
  private readonly data = inject<{ id: number | null }>(MAT_DIALOG_DATA, { optional: true });

  protected readonly $id = signal<number | null>(this.data?.id ?? null);

  protected $isEdit = computed(() => this.$id() !== null);

  constructor() {
    this.clientDialogStore.setId(this.$id());

    effect(() => {
      if (this.clientDialogStore.clientResource.hasValue()) {
        const client = this.clientDialogStore.clientResource.value();
        this.clientForm.patch({ ...client });
      }
    });
  }

  operate() {
    if (this.clientForm.isInvalid()) return;

    const isEdit = this.$isEdit();
    const id = this.$id();
    const client: Client = this.clientForm.value();

    const operator$ = isEdit ? this.clientService.update(id!, client) : this.clientService.save(client);

    operator$.subscribe(() => {
      this.notificationService.notify(isEdit ? 'Updated' : 'Created');
      this.dialogRef.close(true);
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
