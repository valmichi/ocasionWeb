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
    this.renderGoogleButton();
  }

  renderGoogleButton() {
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

    google.accounts.id.prompt(); 
  }

  handleCredentialResponse(response: any) {
    const googleToken = response.credential;
    
    // Llamar al AuthService con el token de Google
    this.authService.loginWithGoogle(googleToken).subscribe({
      next: (res) => {
        // Éxito: El backend verificó el token y devolvió el usuario y el JWT.
        console.log("Login de Google exitoso. Usuario:", res.user);
        
        // Redirección basada en el rol devuelto por el backend
        if (res.user && res.user.role === 'admin') {
          this.router.navigate(['/admin']);
        } else if (res.user) {
          this.router.navigate(['/usuario']); //Rol por defecto
        }
      },
      error: (err) => {
        // Error: Falló la conexión (CORS/IP), la verificación del token de Google, o el backend respondió 401/500.
        console.error("⛔ Error de Autenticación con Google:", err);
        
        // Mostrar un mensaje de error al usuario
        let errorMessage = 'Fallo en el inicio de sesión. Revisa la consola para más detalles.';
        if (err.error && err.error.error) {
           errorMessage = `Error: ${err.error.error}`;
        }
        alert(errorMessage);
      }
    });
  }

  //mock para entrar a cada interfaz sin backend
  login() {
  const email = this.email;
  const password = this.password;
  const role = this.authService.loginMock(email, password);

  if (role === 'admin') {
    this.router.navigate(['/admin']);
  } else if (role === 'user') {
    this.router.navigate(['/usuario']);
  } else {
    alert('Credenciales incorrectas');
  }
}
}
