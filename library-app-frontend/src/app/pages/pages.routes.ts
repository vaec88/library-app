import { Routes } from '@angular/router';

import { ClientListComponent } from './clients/client-list/client-list.component';

export const pagesRoutes: Routes = [
    { path: '', redirectTo: 'clients', pathMatch: 'full' },
    { path: 'clients', component: ClientListComponent }
];
