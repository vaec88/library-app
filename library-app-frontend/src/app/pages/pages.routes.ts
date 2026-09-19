import { Routes } from '@angular/router';

import { BookListComponent } from './books/book-list/book-list.component';
import { CategoryListComponent } from './categories/category-list/category-list.component';
import { ClientListComponent } from './clients/client-list/client-list.component';

export const pagesRoutes: Routes = [
    { path: '', redirectTo: 'clients', pathMatch: 'full' },
    { path: 'categories', component: CategoryListComponent },
    { path: 'books', component: BookListComponent },
    { path: 'clients', component: ClientListComponent }
];
