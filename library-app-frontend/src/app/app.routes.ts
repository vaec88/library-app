import { Routes } from '@angular/router';

import { LayoutComponent } from './core/layout/layout.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
    { path: '', redirectTo: 'pages', pathMatch: 'full' },
    {
        path: 'pages',
        component: LayoutComponent,
        loadChildren: () => import('./pages/pages.routes').then(m => m.pagesRoutes)
    },
    { path: '**', component: NotFoundComponent }
];
