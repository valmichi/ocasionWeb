import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

declare const google: any; // evita errores TS por la librería global

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  modo: 'login' | 'registro' = 'login';

  login = {
    email: '',
    password: ''
  };

  registro = {
    nombre: '',
    apPaterno: '',
    apMaterno: '',
    email: '',
    telefono: '',
    password: '',
    rol: 'cliente',
    fecha: ''
  };

  // El CLIENT_ID debe coincidir con la credencial de Google Cloud
  private GOOGLE_CLIENT_ID = '101437584768-lcblob3rb82p9vj9v63p6j5m1fh7vh24.apps.googleusercontent.com';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Es buena práctica inicializar la fecha en ngOnInit
    this.setFechaHoy();
    // La inicialización del botón debe hacerse después de cargar el DOM
    this.initializeGoogleButton(); 
  }

  // Se usa setTimeout para esperar a que el script de Google cargue completamente
  initializeGoogleButton(retry = 0) {
    const MAX_RETRIES = 10;

    // 1. Verificar si el script ya está cargado
    if (typeof google === 'undefined' || !google?.accounts?.id) {
      if (retry < MAX_RETRIES) {
        setTimeout(() => this.initializeGoogleButton(retry + 1), 300);
      }
      return;
    }

    // 2. Verificar que el div exista en el DOM
    const btnContainer = document.getElementById('google-btn');

    if (!btnContainer) {
      if (retry < MAX_RETRIES) {
        setTimeout(() => this.initializeGoogleButton(retry + 1), 300);
      }
      return;
    }

    // Limpia contenido anterior para evitar que falle al re-renderizar
    btnContainer.innerHTML = '';

    // 3. Inicializar Google Sign-In (GSI)
    google.accounts.id.initialize({
      client_id: this.GOOGLE_CLIENT_ID,
      callback: (response: any) => this.handleCredentialResponse(response)
    });

    // 4. Renderizar el botón
    google.accounts.id.renderButton(btnContainer, {
      theme: 'filled_blue',
      size: 'large',
      width: 260
    });
  }


  // =======================================================
  // FUNCIÓN CORREGIDA: ENVÍA EL TOKEN AL BACKEND Y SE SUSCRIBE
  // =======================================================
  handleCredentialResponse(response: any) {
    // response.credential es el ID token JWT REAL que debemos enviar al backend
    console.log('Google token recibido:', response.credential);

    // Llamamos al servicio y nos SUSCRIBIMOS para ejecutar la petición HTTP
    this.authService.loginWithGoogle(response.credential).subscribe({
        next: (backendResponse) => {
            // Si la petición es exitosa, el backend ya guardó el usuario en NFS
            console.log('Autenticación Google exitosa vía Node.js:', backendResponse.user.email);
            
            // Redirección por rol devuelto por el backend
            if (backendResponse.user.role === 'propietario') {
                this.router.navigate(['/propietario']); // Asumiendo que el rol 'propietario' va a '/propietario'
            } else {
                this.router.navigate(['/usuario']);
            }
        },
        error: (err) => {
            // Este error puede venir del backend (401 - token inválido) o de la red.
            console.error('Error al intentar autenticar con el backend:', err);
            alert('Fallo la autenticación. Revisa que el token de Google sea válido y que el backend esté corriendo en el puerto correcto.');
        }
    });
    
  }


  iniciarSesion() {
    const user = this.authService.loginMock(this.login.email, this.login.password);

    if (!user) {
      console.warn('Credenciales inválidas');
      return;
    }

    if (user.role === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/usuario']);
    }
  }


  registrar() {
    const user = this.authService.registroMock(this.registro);

    if (user.role === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/usuario']);
    }
  }

  getFechaLocal(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  setFechaHoy() {
    const hoy = new Date();
    // Fecha local sin convertir a UTC
    hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
    this.registro.fecha = hoy.toISOString().slice(0, 10);
  }

}