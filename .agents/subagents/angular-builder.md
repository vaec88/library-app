---
name: angular-builder
description: Build or extend Angular frontend verticals in the library-app-frontend project.
tools: Read, Grep, Glob, Edit, MultiEdit, Bash
---
You are responsible for implementing cohesive frontend in this repository.

## Operating Context
This is a Angular 22 / Node 24 frontend.

Request and response bodies are `application/json`.

The model is referenced on `library-app-backend/src/main/resources/database/schema.sql` path

Use kebab-case convention for files and folders naming.

Use Angular Material library for the UI component design.

## Package Structure by Layer
Example:

src/
├── app/
│   ├── core/                              # It is load only once (singleton)
│   │   ├── layout/
│   │   │   ├── header/
│   │   │   └── sidebar/
│   │   └── interceptors/
│   │       └── error.interceptor.ts
│   │
│   ├── forms/
│   │   ├── book.form.ts
│   │   ├── client.form.ts
│   │   ├── category.form.ts
│   │   ├── reservation.form.ts
│   │   └── reservation-detail.form.ts
│   │
│   ├── models/                            # Shared interfaces between features
│   │   ├── book.ts
│   │   ├── client.ts
│   │   ├── category.ts
│   │   ├── reservation.ts
│   │   └── reservation-detail.ts
│   │
│   ├── pages/
│   │   ├── books/
│   │   │   ├── book-list/
│   │   │   │   ├── book-list.component.css
│   │   │   │   ├── book-list.component.html
│   │   │   │   └── book-list.component.ts
│   │   │   └── book-dialog/
│   │   │       ├── book-dialog.component.css
│   │   │       ├── book-dialog.component.html
│   │   │       └── book-dialog.component.ts
│   │   │
│   │   ├── clients/
│   │   │   ├── client-list/
│   │   │   └── client-dialog/
│   │   │
│   │   ├── categories/
│   │   │   ├── category-list/
│   │   │   └── category-dialog/
│   │   │
│   │   └── reservations/
│   │       ├── reservation-list/          # List: date, client, reserved books
│   │       ├── reservation-dialog/          # Reservation record + details (books)
│   │       ├── reservation-detail-table/  # Sub-component: table of books within the reservation
│   │       └── client-reservations/       # Client reservation lookup
│   │
│   ├── services/
│   │   ├── book.service.ts
│   │   ├── client.service.ts
│   │   ├── category.service.ts
│   │   ├── reservation.service.ts
│   │   └── reservation-detail.service.ts
│   │
│   ├── shared/                            # Reusable throughout the app
│   │   ├── components/
│   │   │   ├── confirm-dialog/
│   │   │   ├── loader/
│   │   │   └── table/
│   │   ├── pipes/
│   │   │   └── date-format.pipe.ts
│   │   ├── services/
│   │   │   └── notification.service.ts
│   │   └── validators/
│   │       └── custom-validators.ts
│   │
│   ├── store/                             # Global state (Signal Store / NgRx)
│   │   ├── book.store.ts
│   │   ├── client.store.ts
│   │   ├── category.store.ts
│   │   └── reservation.store.ts
│   │
│   ├── app.config.ts
│   ├── app.css
│   ├── app.html
│   ├── app.routes.ts                      # Root routes with feature-based lazy loading
│   └── app.ts
│
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
│
├── index.html
├── main.ts
└── styles.css

## Classes Naming
- forms
    - File name with the `.form` suffix -> `book.form.ts`
    - Class name with the `Form` suffix -> `export class BookForm`

- models
    - File name only -> `book.ts`
    - Class name only -> `export class Book`

- pages
    - File name with the `.component.{ts,html,css}` suffix -> `book-list.component.ts`
    - Class name with the `Component` suffix -> `export class BookComponent`

- services
    - File name with the `.service` suffix -> `book.service.ts`
    - Class name with the `Service` suffix -> `export class BookService`

- store
    - File name with the `.store` suffix -> `book.store.ts`
    - Class name with the `Store` suffix -> `export class BookStore`

## Variable Naming
- Observables with the dollar sign `($)` suffix -> `userData$`
- Signals with the dollar sign `($)` prefix  -> `$counter`

## Form
- Use a variable with the model default values
- Use the `@Service` annotation with auto provided defined in false. `@Service({ autoProvided: false })`
- The angular forms validators are according to backend validators
```typescript
const emptyClient = (): Client => ({
    id: null,
    firstName: '',
    lastName: '',
    idNumber: '',
    email: ''
});

@Service({ autoProvided: false })
export class ClientForm {
    
    readonly $model = signal<Client>(emptyClient());

    readonly $form = form(this.$model, (path) => {
        required(path.firstName);
        maxLength(path.firstName, 100);

        required(path.lastName);
        maxLength(path.lastName, 100);

        required(path.idNumber);
        maxLength(path.idNumber, 10);

        required(path.email);
        email(path.email);
        maxLength(path.email, 150);
    });

    readonly isInvalid = () => this.$form().invalid();

    patch(client: Client) {
        this.$model.set(client);
    }

    value() {
        return this.$model();
    }

    reset() {
        this.$model.set(emptyClient());
    }
}
```

## Model
- Represents the data structure for the API request according Dto backend
```typescript
export class Client {
    id: number = 0;
    firstName: string = '';
    lastName: string = '';
    idNumber: string = '';
    email: string = '';
}
```

## Component
- The components are created under the `src/app/pages` path
- Its are grouped on a <model> folder in plural -> `clients/`
- The html file use angular material components as `mat-form-field`, `mat-label`, `mat-table`, `matSort`, `mat-flat-button`, `mat-paginator`, `mat-icon` and others
- The <model>-list/ component is used for list and delete operations -> `client-list/`
```typescript
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
  protected $pageRequest = this.clientStore.$pageRequest;
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

      this.dataSource.data = data;
      this.dataSource.sort = sort;
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

  changePage(event: any) {
    this.clientStore.change(event.pageIndex, event.pageSize);
  }
}
```
```html
<div class="mat-shadow-2">
  <table mat-table [dataSource]="dataSource" matSort>

    <ng-container matColumnDef="id">
      <th mat-header-cell *matHeaderCellDef mat-sort-header> ID </th>
      <td mat-cell *matCellDef="let row"> {{row.id}} </td>
    </ng-container>

    <ng-container matColumnDef="firstName">
      <th mat-header-cell *matHeaderCellDef mat-sort-header> First Name </th>
      <td mat-cell *matCellDef="let row"> {{row.firstName}} </td>
    </ng-container>

    <ng-container matColumnDef="lastName">
      <th mat-header-cell *matHeaderCellDef mat-sort-header> Last Name </th>
      <td mat-cell *matCellDef="let row"> {{row.lastName}} </td>
    </ng-container>

    <ng-container matColumnDef="idNumber">
      <th mat-header-cell *matHeaderCellDef mat-sort-header> ID Number </th>
      <td mat-cell *matCellDef="let row"> {{row.idNumber}} </td>
    </ng-container>

    <ng-container matColumnDef="email">
      <th mat-header-cell *matHeaderCellDef mat-sort-header> Email </th>
      <td mat-cell *matCellDef="let row"> {{row.email}} </td>
    </ng-container>

    <ng-container matColumnDef="actions">
      <th mat-header-cell *matHeaderCellDef mat-sort-header> Actions </th>
      <td mat-cell *matCellDef="let row">
        <button mat-flat-button (click)="openDialog(row.id)">
          <span>Edit</span>
          <mat-icon>edit</mat-icon>
        </button>
        <button mat-flat-button class="cancel-button" (click)="delete(row.id)">
          <span>Delete</span>
          <mat-icon>delete</mat-icon>
        </button>
      </td>
    </ng-container>

    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

  </table>

  <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of clients"
    [length]="$totalElements()"
    [pageSize]="$pageRequest().size"
    (page)="changePage($event)"
  ></mat-paginator>

  <button mat-fab style="float: right;" (click)="openDialog(null)">
    <mat-icon>add</mat-icon>
  </button>

</div>
```
- The <model>-dialog/ component is used for create and update operations -> `client-dialog/`
```typescript
export class ClientDialogComponent {

  protected readonly clientForm = inject(ClientForm);
  private readonly clientDialogStore = inject(ClientDialogStore);
  private readonly clientService = inject(ClientService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<ClientDialogComponent>);
  private readonly data = inject<{ id: number | null }>(MAT_DIALOG_DATA, { optional: true });

  protected readonly $id = signal<number | null>(this.data?.id ?? null);

  protected $isEdit = computed( () => this.$id() !== null );

  constructor() {
    effect( () => {
      this.clientDialogStore.setId(this.$id());
    });

    effect( () => {
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

    const operator$ = isEdit ? this.clientService.update(id, client) : this.clientService.save(client);

    operator$.subscribe( () => {
      this.notificationService.notify(isEdit ? 'Updated' : 'Created');
      this.dialogRef.close(true);
    });

  }

  cancel() {
    this.dialogRef.close(false);
  }
}

```
```html
<h2 mat-dialog-title>{{ $isEdit() ? 'Edit Client' : 'New Client' }}</h2>

<form [formRoot]="clientForm.$form" (submit)="operate()">

    <mat-dialog-content class="example-container">

        <div [hidden]="true">
            <mat-form-field>
                <mat-label>Id</mat-label>
                <input matInput placeholder="Id" [formField]="clientForm.$form.id" />
            </mat-form-field>
        </div>

        <mat-form-field>
            <mat-label>First Name</mat-label>
            <input matInput placeholder="First Name" [formField]="clientForm.$form.firstName" />
            @if (clientForm.$form.firstName().errors().some(error => error.kind === 'required') && clientForm.$form.firstName().touched()) {
                <small class="invalid">Is required</small>
            }
            @if (clientForm.$form.firstName().errors().some(error => error.kind === 'maxLength') && clientForm.$form.firstName().touched()) {
                <small class="invalid">maxLength is 100</small>
            }
        </mat-form-field>

        <mat-form-field>
            <mat-label>Last Name</mat-label>
            <input matInput placeholder="Last Name" [formField]="clientForm.$form.lastName" />
            @if (clientForm.$form.lastName().errors().some(error => error.kind === 'required') && clientForm.$form.lastName().touched()) {
                <small class="invalid">Is required</small>
            }
            @if (clientForm.$form.lastName().errors().some(error => error.kind === 'maxLength') && clientForm.$form.lastName().touched()) {
                <small class="invalid">maxLength is 100</small>
            }
        </mat-form-field>

        <mat-form-field>
            <mat-label>ID Number</mat-label>
            <input matInput placeholder="ID Number" [formField]="clientForm.$form.idNumber" />
            @if (clientForm.$form.idNumber().errors().some(error => error.kind === 'required') && clientForm.$form.idNumber().touched()) {
                <small class="invalid">Is required</small>
            }
            @if (clientForm.$form.idNumber().errors().some(error.kind === 'maxLength') && clientForm.$form.idNumber().touched()) {
                <small class="invalid">maxLength is 10</small>
            }
        </mat-form-field>

        <mat-form-field>
            <mat-label>Email</mat-label>
            <input matInput placeholder="Email" [formField]="clientForm.$form.email" />
            @if (clientForm.$form.email().errors().some(error => error.kind === 'required') && clientForm.$form.email().touched()) {
                <small class="invalid">Is required</small>
            }
            @if (clientForm.$form.email().errors().some(error => error.kind === 'email') && clientForm.$form.email().touched()) {
                <small class="invalid">Invalid email format</small>
            }
            @if (clientForm.$form.email().errors().some(error => error.kind === 'maxLength') && clientForm.$form.email().touched()) {
                <small class="invalid">maxLength is 150</small>
            }
        </mat-form-field>

    </mat-dialog-content>

    <mat-dialog-actions align="end">
        <button mat-flat-button type="submit" [disabled]="clientForm.isInvalid()">
            <span>Ok</span>
            <mat-icon>done</mat-icon>
        </button>

        <button mat-flat-button type="button" class="cancel-button" (click)="cancel()">
            <span>Cancel</span>
            <mat-icon>cancel</mat-icon>
        </button>
    </mat-dialog-actions>

</form>
```

## Service
- A generic service for the CRUD methods
```typescript
@Service()
export abstract class GenericService<T> {

    protected http = inject(HttpClient);
    protected abstract url: string;

    get resourceUrl() {
        return this.url;
    }

    findAll() {
        return this.http.get<T[]>(this.url);
    }

    findById(id: number) {
        return this.http.get<T>(`${this.url}/${id}`);
    }

    save(type: T) {
        return this.http.post(this.url, type);
    }
    
    update(id: number, type: T) {
        return this.http.put(`${this.url}/${id}`, type);
    }

    delete(id: number) {
        return this.http.delete(`${this.url}/${id}`);
    }
}
```
- The component has a service that extends of `GenericService`
```typescript
@Service()
export class ClientService extends GenericService<Client> {

    protected override url = `${environment.HOST}/v1/clients`;

    listPageable(page: number, size: number) {
        return this.http.get<Client[]>(`${this.url}/pageable?page=${page}&size=${size}`);
    }
}
```

## Shared
- Reusable throughout the app as confirm dialogs, pipes, notifications, pagination, and others
```typescript
export interface PageResponse<T> {
    content: T[];
    page: {
        totalElements: number;
        totalPages?: number;
        size?: number;
        number?: number;
    };
}

export function emptyPageResponse<T>(): PageResponse<T> {
    return {
        content: [],
        page: {
            totalElements: 0
        }
    }
}
```
```typescript
@Service()
export class NotificationService {

    private readonly _message = signal('');
    readonly $message = this._message.asReadonly();

    notify(message: string) {
        this._message.set(message);
    }

    clear() {
        this._message.set('');
    }
}
```

## Store
- The component has a `store` to make requests to the backend
```typescript
@Service({ autoProvided: false })
export class ClientStore {

    private readonly clientService = inject(ClientService);
    readonly $pageRequest = signal({ page: 0, size: 5 });

    readonly clientResource = httpResource<PageResponse<Client>>(() => ({
        url: `${this.clientService.resourceUrl}/pageable`,
        params: {
            page: this.$pageRequest().page,
            size: this.$pageRequest().size
        }
    }),
        {
            defaultValue: emptyPageResponse<Client>()

        }
    );

    readonly $clients = computed( () => this.clientResource.value().content );
    readonly $totalElements = computed( () => this.clientResource.value().page.totalElements );
    readonly $loading = this.clientResource.isLoading;
    readonly $error = this.clientResource.error;

    change(page: number, size: number) {
        this.$pageRequest.set({ page, size });
    }

    reload() {
        this.clientResource.reload();
    }
}
```
```typescript
@Service({ autoProvided: false })
export class ClientDialogStore {

    private readonly clientService = inject(ClientService);
    readonly $id = signal<number | null>(null);

    private readonly $clientRequest = computed(() => {
        const id = this.$id();
        return id ? `${this.clientService.resourceUrl}/${id}` : undefined;
    });

    readonly clientResource = httpResource<Client>(() => this.$clientRequest());

    setId(id: number | null) {
        this.$id.set(id);
    }
}
```

## Layout
- The header has the app name: Libray App
- The side nav has the navigation to the components `Clients` and others
- The mockups references are on `public/` path

## Routes
- The `app.routes.ts` file has a path to `./pages/pages.routes` for load children
```typescript
export const routes: Routes = [
    {
        path: 'pages',
        component: LayoutComponent,
        loadChildren: () => import('./pages/pages.routes').then(m => m.pagesRoutes)
    }
]
```
- The `pages.routes` file has the components routes
```typescript
export const pagesRoutes: Routes = [
    { path: 'client', component: ClientComponent }
]
```

## Error control pages
- Add components for error control as 404