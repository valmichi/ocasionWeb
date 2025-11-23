import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { FormsModule } from '@angular/forms';
import { Router} from '@angular/router'
declare const google: any;

@Component({
 selector: 'app-login',
 standalone: true,
 imports: [FormsModule],
 templateUrl: './login.component.html',
 styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

 email:string = "";
 password:string = "";

 constructor(private authService: AuthService, private router: Router) {
 }

 ngOnInit(): void {
  setTimeout(() => {
    this.renderGoogleButton();
  }, 0);
 }

 renderGoogleButton() {
  if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
    google.accounts.id.initialize({
      client_id: "101437584768-lcblob3rb82p9vj9v63p6j5m1fh7vh24.apps.googleusercontent.com",
      callback: (response: any) => this.handleCredentialResponse(response)
    });

  const btn = document.getElementById("google-btn");

  if (btn) {
   google.accounts.id.renderButton(btn, {
    theme: "filled_blue",
    size: "large",
    width: "260"
   });
  }
  } else {
    console.error("El SDK de Google no se ha cargado correctamente.");
  }
 }

 //Maneja la respuesta de Google, enviando el token al backend y manejando la sesión.
 handleCredentialResponse(response: any) {
  console.log("TOKEN DE GOOGLE RECIBIDO:", response.credential);

    const googleToken = response.credential;
    
    // Llama al servicio y SE SUSCRIBE al Observable de la petición al backend.
  this.authService.loginWithGoogle(googleToken).subscribe({
        next: (res) => {
            // El backend ya verificó el token, guardó el usuario y asignó el rol.
            console.log("Login exitoso con Backend. Rol:", res.user.role);
            
            // Redirección basada en la respuesta del backend
            if (res.user.role === 'admin') {
                this.router.navigate(['/admin']);
            } else if (res.user.role === 'user') {
                this.router.navigate(['/usuario']);
            }
        },
        error: (err) => {
            console.error("Error en la autenticación con el Backend:", err);
            alert("Error al iniciar sesión con Google. Por favor, inténtalo de nuevo.");
        }
    });
 }

 //Permite el login tradicional para clientes, pero fuerza el uso de Google para el admin de prueba
 login() {
    const email = this.email;
    const password = this.password;
    
    // Implementación de la Restricción para Administradores
    if (email === 'admin@gmail.com') {
        alert('Para acceder como Administrador/Propietario, por favor utilice el botón "Continuar con Google".');
        return;
    }

    // 1. Llama al método de login tradicional (mock o API real) en AuthService
   const role = this.authService.loginMock(email, password);

    // 2. Maneja la redirección para usuarios
   if (role === 'user') {
    this.router.navigate(['/usuario']);
  } else {
    alert('Credenciales incorrectas.');
  }
  }
}