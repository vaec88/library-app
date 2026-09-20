# Feature Spec: Book Reservation

Implementation contract for the reservation vertical, backend and frontend.

- Backend conventions: `.agents/subagents/spring-builder.md`
- Frontend conventions: `.agents/subagents/angular-builder.md`
- Database reference: `library-app-backend/src/main/resources/database/schema.sql`

Where this spec and a builder doc disagree, this spec wins for the reservation feature only; everything it does not mention follows the builder docs and the existing `book` / `category` / `client` verticals.

## 1. Goal

A librarian registers that a client takes one or more books out of the library, sees every reservation, looks up the reservations of one client, and closes a reservation when the books come back.

## 2. Database reference

```sql
CREATE TABLE reservation (
    id                SERIAL PRIMARY KEY,
    reservation_date  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    client_id         INT NOT NULL REFERENCES client(id),
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reservation_detail (
    id             SERIAL PRIMARY KEY,
    reservation_id INT NOT NULL REFERENCES reservation(id),
    book_id        INT NOT NULL REFERENCES book(id),
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

`reservation` is the aggregate root; `reservation_detail` has no life of its own and is always reached through its reservation. The schema is fixed — this feature adds no columns and no tables.

## 3. Business rules

The schema has no return date and no status column, so **the reservation row itself is the record of what is out on loan**:

| # | Rule | Failure |
|---|---|---|
| R1 | The client must exist | 404 `Client id not found: {id}` |
| R2 | A reservation has at least one detail line | 400 validation |
| R3 | The same book cannot appear twice in one reservation | 409 `Duplicated book in the reservation: {id}` |
| R4 | Every book in a detail line must exist | 404 `Book id not found: {id}` |
| R5 | Every book being added must have `available = true` | 409 `This book is not available: {id}` |
| R6 | Creating a reservation sets `available = false` on each of its books | — |
| R7 | Deleting a reservation sets `available = true` on each of its books, then deletes the reservation and its details | — |
| R8 | Updating a reservation recalculates: books dropped from the detail list are freed (`true`), books added are taken (`false`, after R4/R5), books kept are untouched | — |
| R9 | A book that appears in any reservation cannot be deleted | 409 `This book has reservations and cannot be deleted` |
| R10 | `reservation_date` defaults to now when the payload omits it | — |

R9 extends the rule already applied to categories in `CategoryServiceImpl.delete`, and belongs in `BookServiceImpl.delete`.

## 4. Backend

Project: `library-app-backend`, package `com.library`. Follow `spring-builder.md` for layer naming, Lombok annotations, `@RequiredArgsConstructor`, `ResponseEntity` returns and the `OnCreate` / `OnUpdate` validation groups.

### 4.1 Files

```
model/Reservation.java
model/ReservationDetail.java
dto/ReservationDto.java
dto/ReservationDetailDto.java
repository/IReservationRepository.java
service/IReservationService.java
service/impl/ReservationServiceImpl.java
controller/ReservationRestController.java
exception/ReservationException.java
```

Changed: `exception/GlobalExceptionHandler.java` (map `ReservationException`), `service/impl/BookServiceImpl.java` (R9), `repository/IBookRepository.java` if a lock query is added.

No `ReservationDetail` controller, service or repository: details are created, replaced and removed through their reservation. (`angular-builder.md` shows a `reservation-detail.service.ts` in its example tree — not needed here, because detail lines travel inside the reservation payload.)

### 4.2 Model

`Reservation`
- `id` — `@Id @GeneratedValue(IDENTITY) @EqualsAndHashCode.Include`
- `reservationDate` — `@Column(name = "reservation_date", nullable = false)`, `LocalDateTime`
- `client` — `@ManyToOne(fetch = LAZY) @JoinColumn(name = "client_id", nullable = false)`
- `details` — `@OneToMany(mappedBy = "reservation", cascade = ALL, orphanRemoval = true)`, `List<ReservationDetail>`, initialized to an empty list
- `@PrePersist` sets `reservationDate = LocalDateTime.now()` **only when it is null** (same guard style as `Book.available`)
- extends `BaseEntity`

`ReservationDetail`
- `id` as above
- `reservation` — `@ManyToOne(fetch = LAZY) @JoinColumn(name = "reservation_id", nullable = false)`, annotated `@ToString.Exclude`
- `book` — `@ManyToOne(fetch = LAZY) @JoinColumn(name = "book_id", nullable = false)`
- extends `BaseEntity`

> The `@ToString.Exclude` on the back-reference is required: `@Data` on both sides of a bidirectional association produces infinite recursion in `toString()`.

Helper on `Reservation` to keep both sides consistent:

```java
public void addDetail(ReservationDetail detail) {
    detail.setReservation(this);
    details.add(detail);
}
```

### 4.3 Dto

`ReservationDto`
| Field | Rules |
|---|---|
| `id` | `@JsonProperty(access = READ_ONLY)` |
| `reservationDate` | optional; `LocalDateTime` |
| `clientId` | `@NotNull(groups = OnCreate.class)` |
| `clientName` | `@JsonProperty(access = READ_ONLY)` — `firstName + " " + lastName` |
| `details` | `@Valid`, `@NotEmpty(groups = OnCreate.class)`, `List<ReservationDetailDto>` |

`ReservationDetailDto`
| Field | Rules |
|---|---|
| `id` | `@JsonProperty(access = READ_ONLY)` |
| `bookId` | `@NotNull(groups = {OnCreate.class, OnUpdate.class})` |
| `bookTitle` | `@JsonProperty(access = READ_ONLY)` |

Both carry `@Data @AllArgsConstructor @NoArgsConstructor @JsonInclude(NON_NULL)`.

### 4.4 Repository

```java
public interface IReservationRepository extends IGenericRepository<Reservation, Integer> {

    @EntityGraph(attributePaths = {"client", "details", "details.book"})
    Page<Reservation> findAll(@NonNull Pageable pageable);

    @EntityGraph(attributePaths = {"client", "details", "details.book"})
    Page<Reservation> findByClientId(Integer clientId, Pageable pageable);

    boolean existsByDetailsBookId(Integer bookId);
}
```

The entity graphs are mandatory — without them every list page fires a query per reservation, per detail and per book. `existsByDetailsBookId` backs R9.

### 4.5 Service

`IReservationService extends ICrudService<Reservation, Integer>` plus `Page<Reservation> findByClientId(Integer clientId, Pageable pageable)`.

`ReservationServiceImpl extends CrudServiceImpl<Reservation, Integer>`:
- injects `IReservationRepository`, `IClientRepository`, `IBookRepository` — repositories only, never another service, so no cross-vertical bean cycle can form
- `save`, `update` and `delete` are `@Transactional`; `findByClientId` is `@Transactional(readOnly = true)`
- `save`: resolve the client (R1), reject duplicate book ids (R3), load and check each book (R4, R5), flip `available = false` (R6), wire both sides of each detail, save once
- `update(Integer id, Reservation entity)`: keeps the null-means-leave-it convention of the other services for `reservationDate` and `client`; when `details` is non-null it is the **full new set** of lines, and the diff of R8 applies
- `delete`: load the reservation, free its books (R7), then delete — cascade removes the detail rows

Availability is a check-then-write across two rows, exactly the race already known in the category rules. Read each book for update (`@Lock(PESSIMISTIC_WRITE)` on a repository lookup) inside the transaction before flipping it, so two concurrent reservations cannot take the same book.

### 4.6 Controller

`ReservationRestController`, `@RequestMapping("/v1/reservations")`, injecting `IReservationService` and the `@Qualifier("defaultMapper")` `ModelMapper`.

| Method | Path | Body | Success | Errors |
|---|---|---|---|---|
| GET | `/v1/reservations?page=&size=` | — | 200 `Page<ReservationDto>` | — |
| GET | `/v1/reservations/{id}` | — | 200 `ReservationDto` | 404 |
| GET | `/v1/reservations/client/{clientId}?page=&size=` | — | 200 `Page<ReservationDto>` | 404 client |
| POST | `/v1/reservations` | `ReservationDto` | 201, `Location`, empty body | 400, 404, 409 |
| PUT | `/v1/reservations/{id}` | `ReservationDto` | 200 `ReservationDto` | 400, 404, 409 |
| DELETE | `/v1/reservations/{id}` | — | 204 | 404 |

POST validates `@Validated({Default.class, OnCreate.class})`, PUT `@Validated({Default.class, OnUpdate.class})`. Pagination is on the base path with `page` / `size` params (`PageableConfig` serializes `VIA_DTO`), matching books, categories and clients — there is no `/pageable` sub-path anywhere in this API.

### 4.7 Mapping

Entity → Dto is implicit: `client.id → clientId`, `details[].book.id → bookId`, `details[].book.title → bookTitle`. `clientName` has no single source, so add a `TypeMap` for `Reservation → ReservationDto` in `MapperConfig` that builds it from `firstName` and `lastName`.

Dto → Entity is only a carrier for ids: the controller maps the flat fields, and the service resolves the real `Client` and `Book` rows. Never persist an entity graph built by the mapper alone.

Verify the mapping before wiring the controller — the same throwaway `ModelMapper` check used for `BookDto` is enough, and it needs no database.

### 4.8 Errors

```java
public class ReservationException extends RuntimeException { ... }
```

Mapped in `GlobalExceptionHandler` to **409 Conflict** with a `ProblemDetail`, next to `CategoryStatusException`. R1 and R4 reuse `ModelNotFoundException` (404) with entity-specific messages. R2 and malformed payloads surface through the existing `MethodArgumentNotValidException` handler (400 with the `errors` map).

## 5. Frontend

Project: `library-app-frontend`. Follow `angular-builder.md` (kebab-case files, Angular Material, signal forms, `$`-prefixed signals) and mirror the existing book vertical, which is the closest reference for server-side paging.

### 5.1 Files

```
models/reservation.ts
models/reservation-detail.ts
forms/reservation.form.ts
services/reservation.service.ts
store/reservation.store.ts
store/reservation-dialog.store.ts
pages/reservations/reservation-list/reservation-list.component.{ts,html,css}
pages/reservations/reservation-dialog/reservation-dialog.component.{ts,html,css}
pages/reservations/reservation-detail-table/reservation-detail-table.component.{ts,html,css}
pages/reservations/client-reservations/client-reservations.component.{ts,html,css}
```

Changed: `pages/pages.routes.ts` (routes `reservations` and `client-reservations`), `core/layout/sidebar/sidebar.component.ts` (nav entries).

### 5.2 Models

```typescript
export class Reservation {
    id: number | null = null;
    reservationDate: string | null = null;
    clientId: number | null = null;
    clientName: string = '';
    details: ReservationDetail[] = [];
}

export class ReservationDetail {
    id: number | null = null;
    bookId: number | null = null;
    bookTitle: string = '';
}
```

### 5.3 Service and stores

`ReservationService extends GenericService<Reservation>` with url `${environment.HOST}/v1/reservations`, plus a `clientResourceUrl(clientId)` helper for the client lookup path.

`ReservationStore` — the `BookStore` shape: `$pageRequest = signal({ page: 0, size: 5 })`, `httpResource<PageResponse<Reservation>>` on the base url with `params { page, size }`, `defaultValue: emptyPageResponse<Reservation>()`, exposing `$reservations`, `$totalElements`, `$loading`, `$error`, `change(page, size)`, `reload()`. Reuse `shared/models/page-response.ts`.

`ReservationDialogStore` — three resources:
- the reservation being edited (`undefined` when creating), like `BookDialogStore`
- the client options: `/v1/clients` with `params { page: 0, size: 100 }`, read `.content`
- the book options: `/v1/books` with `params { page: 0, size: 100 }`, read `.content` and keep only `available === true`

> **When editing**, the books already on the reservation are `available = false` and would disappear from the picker. The store must merge the reservation's own detail books into the option list, or the user loses them on save. This is the bug already visible in `book-dialog` with disabled categories — do not repeat it here.

### 5.4 Components

`reservation-list` — Material table, columns `id, reservationDate, clientName, books, actions`, where `books` renders the detail count or the joined titles. `mat-paginator` bound to `[length]="$totalElements()"`, `[pageSize]="$pageRequest().size"`, `[pageIndex]="$pageRequest().page"`, `(page)="changePage($event)"`. Do **not** assign `dataSource.paginator` — paging is server-side; assign only `dataSource.data` and `dataSource.sort`. Add-fab opens the dialog, delete goes through `ConfirmDialogComponent`, messages through `NotificationService`.

`reservation-dialog` — client `mat-select`, optional date field (empty means "now"), and the detail table below. Save is disabled while the form is invalid or the detail list is empty. `toPayload` sends `clientId`, `reservationDate` and `details` as `[{ bookId }]` only — never `clientName`, `bookTitle` or detail `id`s.

`reservation-detail-table` — sub-component of the dialog: a book `mat-select` plus an add button, a table of chosen books with a remove button per row, and no duplicate book ids (the select filters out books already in the list, mirroring R3). It receives the detail list and emits changes; it does not call the API.

`client-reservations` — pick a client, then page through `/v1/reservations/client/{clientId}`; read-only, no edit or delete.

### 5.5 Errors

The backend answers 409 for an unavailable or duplicated book and 404 for a missing client or book. These arrive as `ProblemDetail`; surface `detail` through the existing `error.interceptor.ts` / `NotificationService` path rather than a silent failure.

## 6. Acceptance criteria

- [ ] Creating a reservation with two available books returns 201 and both books are `available = false` afterwards
- [ ] Creating a reservation that includes an unavailable book returns 409 and **no** book changed state
- [ ] Creating a reservation with the same book twice returns 409
- [ ] Creating a reservation with an empty `details` list returns 400
- [ ] Deleting a reservation returns 204 and every one of its books is `available = true` again
- [ ] Updating a reservation to drop one book and add another frees the first and takes the second
- [ ] Deleting a book that belongs to a reservation returns 409
- [ ] `GET /v1/reservations?page=0&size=5` returns `{content, page}` and issues a bounded number of queries (entity graphs in place)
- [ ] `GET /v1/reservations/client/{id}` returns only that client's reservations, paginated
- [ ] The list page changes server page on paginator interaction, and the count comes from `page.totalElements`
- [ ] The dialog cannot submit an empty detail list, and cannot add the same book twice
- [ ] Editing an existing reservation keeps its current books selectable

## 7. Verification

```
library-app-backend>  mvnw.cmd -q -DskipTests compile
library-app-frontend> npm run build
```

Both must pass. The ModelMapper check of §4.7 runs without a database. Endpoint behavior (§6) needs a running PostgreSQL and is manual for now — there are still no automated tests in either project.

## 8. Known gaps this spec does not close

- **No return flow.** A book comes back only by deleting the reservation or removing its line; there is no history of past loans. Adding `returned` / `return_date` to `reservation_detail` is the natural next step and is out of scope here.
- **Lookup lists are capped at 100.** The client and book pickers page the paginated endpoints with `size=100`, the same limitation as the category picker in `book-dialog`. A dedicated unpaginated lookup endpoint would remove the cap.
- **No optimistic locking.** Reservations inherit the missing `@Version` on `BaseEntity`, so concurrent edits of the same reservation still last-write-win; the pessimistic lock of §4.5 protects `book.available`, not the reservation row.
- **No automated tests.** Every rule in §3 is verified by hand.
