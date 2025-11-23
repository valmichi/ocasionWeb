import { Component, OnInit, NgModule } from '@angular/core';
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
    // Este token lo enviarás a backend después
    console.log("TOKEN DE GOOGLE:", response.credential);

    this.authService.loginWithGoogle({
      name: "Usuario Google",
      email: "prueba@gmail.com",
      role: "user",
      token: response.credential
    });

    // Redirecciones cuando agregues routing
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
