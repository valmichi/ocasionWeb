import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from "./vistas/login/login.component";
import { AdminComponent } from "./vistas/admin/admin.component";
import { UsuarioComponent } from "./vistas/usuario/usuario.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ocasionWeb';
}
