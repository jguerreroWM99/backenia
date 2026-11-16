import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';

import { headerComponent } from './componentes/header/headerComponent';
import { sidebarComponent } from './componentes/sidebar/sidebarComponent';
import { AuthService } from './services/authService';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    headerComponent,
    sidebarComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  sidebarColapsado: boolean = false;

  constructor(public authService: AuthService) {}

  toggleSidebar(): void {
    this.sidebarColapsado = !this.sidebarColapsado;
  }
}
