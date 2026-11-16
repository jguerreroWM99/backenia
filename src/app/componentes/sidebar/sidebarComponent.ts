import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { HasRoleDirective } from '../../directives/hasRoleDirective';
import { AuthService } from '../../services/authService';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    HasRoleDirective
  ],
  templateUrl: './sidebarComponent.html',
  styleUrl: './sidebarComponent.css'
})
export class sidebarComponent implements OnInit {
  @Input() colapsado: boolean = false;
  modoOscuro: boolean = false;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    const temaGuardado = localStorage.getItem('app_theme');
    this.modoOscuro = temaGuardado === 'dark';
    this.aplicarTema();
  }

  alternarTema(): void {
    this.modoOscuro = !this.modoOscuro;
    localStorage.setItem('app_theme', this.modoOscuro ? 'dark' : 'light');
    this.aplicarTema();
  }

  private aplicarTema(): void {
    if (this.modoOscuro) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
