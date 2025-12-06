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
    fecha: ''
  };

  // reemplaza por tu CLIENT_ID real
  private GOOGLE_CLIENT_ID = '101437584768-lcblob3rb82p9vj9v63p6j5m1fh7vh24.apps.googleusercontent.com';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
  this.initializeGoogleButton();
  this.setFechaHoy();
}

initializeGoogleButton(retry = 0) {
  const MAX_RETRIES = 10;

  // Verifica si el script ya está cargado
  if (typeof google === 'undefined' || !google?.accounts?.id) {
    if (retry < MAX_RETRIES) {
      setTimeout(() => this.initializeGoogleButton(retry + 1), 300);
    }
    return;
  }

  // Verifica que el div exista en el DOM
  const btnContainer = document.getElementById('google-btn');

  if (!btnContainer) {
    if (retry < MAX_RETRIES) {
      setTimeout(() => this.initializeGoogleButton(retry + 1), 300);
    }
    return;
  }

  // Limpia contenido anterior para evitar que falle al re-renderizar
  btnContainer.innerHTML = '';

  google.accounts.id.initialize({
    client_id: this.GOOGLE_CLIENT_ID,
    callback: (response: any) => this.handleCredentialResponse(response)
  });

  google.accounts.id.renderButton(btnContainer, {
    theme: 'filled_blue',
    size: 'large',
    width: 260
  });
}


  // Maneja la respuesta (JWT) que entrega Google
  handleCredentialResponse(response: any) {
    // response.credential es un ID token JWT (base64)
    console.log('Google token:', response.credential);

    // Por ahora hacemos login mock con los datos del token:
    // En producción deberías enviar response.credential al backend para validarlo y crear/obtener usuario.
    const mockUser = {
    name: 'Usuario Google',
    email: 'googleuser@example.com',
    role: 'user',  // puedes cambiar a 'admin' si quieres
    token: response.credential
  };

    this.authService.loginWithGoogle(mockUser.token);

     //  Guardamos el usuario manualmente para simular el backend
  this.authService.saveUser(mockUser);

  //  Redirección por rol
  if (mockUser.role === 'admin') {
    this.router.navigate(['/admin']);
  } else {
    this.router.navigate(['/usuario']);
  
  }
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
