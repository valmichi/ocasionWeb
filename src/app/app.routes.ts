import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { LoginComponent } from './vistas/login/login.component';
import { UsuarioComponent } from './vistas/usuario/usuario.component';
import { AdminComponent } from './vistas/admin/admin.component';
import { DetalleSalonComponent } from './vistas/detalle-salon/detalle-salon.component';
import { FullCalendarModule } from '@fullcalendar/angular';

export const routes: Routes = [
    {path: '', component: LoginComponent},
    { path: 'usuario', component: UsuarioComponent },
    { path: 'admin', component: AdminComponent },
    { path: 'detalle-salon/:id', component: DetalleSalonComponent },
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
