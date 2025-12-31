import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './main.layout.html',
})
export class MainLayoutComponent {
  isCollapsed = signal(false);

  toggleSidebar() {
    this.isCollapsed.update((v) => !v);
  }
}
