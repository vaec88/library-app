import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [MatListModule, MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  protected readonly links = [
    { path: '/pages/categories', label: 'Categories', icon: 'category' },
    { path: '/pages/books', label: 'Books', icon: 'book' },
    { path: '/pages/clients', label: 'Clients', icon: 'people' }
  ];
}
