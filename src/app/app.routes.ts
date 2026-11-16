import { Routes } from '@angular/router';
import { authGuard } from './guards/authGuard';
import { forcePasswordGuard } from './guards/forcePasswordGuard';

import { loginComponent } from './componentes/login/loginComponent';
import { recuperarPasswordComponent } from './componentes/recuperarPassword/recuperarPasswordComponent';
import { CambiarPasswordComponent } from './componentes/cambiar-password/cambiar-password';
import { productosListaComponent } from './componentes/productos-lista-component/productos-lista-component';
import { UsuariosListaComponent } from './componentes/usuarios-lista/usuarios-lista';
import { perfilComponent } from './componentes/perfil/perfilComponent';

export const routes: Routes = [
  { path: 'login', component: loginComponent },
  { path: 'recuperar-password', component: recuperarPasswordComponent },
  {
    path: 'cambiar-password',
    component: CambiarPasswordComponent,
    canActivate: [authGuard]
  },
  {
    path: 'almacen/productos',
    component: productosListaComponent,
    canActivate: [authGuard, forcePasswordGuard]
  },
  {
    path: 'almacen/usuarios',
    component: UsuariosListaComponent,
    canActivate: [authGuard, forcePasswordGuard]
  },
  {
    path: 'almacen/perfil',
    component: perfilComponent,
    canActivate: [authGuard, forcePasswordGuard]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
