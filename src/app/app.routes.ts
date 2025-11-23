import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { LoginComponent } from './vistas/login/login.component';
import { UsuarioComponent } from './vistas/usuario/usuario.component';
import { AdminComponent } from './vistas/admin/admin.component';

export const routes: Routes = [
    {path: '', component: LoginComponent},
    { path: 'usuario', component: UsuarioComponent },
    { path: 'admin', component: AdminComponent },
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
