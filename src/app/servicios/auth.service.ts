import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
    private userKey = 'userData';
    private tokenKey = 'appToken'; // Clave para guardar el token de la aplicación (JWT)
    private apiUrl = 'http://192.168.193.127:3000/api/auth/google';
    private loginManualApiUrl = 'http://192.168.193.127:3000/api/auth/login';
    private registroApiUrl = 'http://192.168.193.127:3000/api/registrar';
    
    // Para saber si el usuario está logueado
    private currentUserSubject = new BehaviorSubject<any>(this.getUser());
    
    constructor(private http: HttpClient) { }

  loginWithGoogle(googleToken: string): Observable<any> {
    // El backend espera un objeto { token: 'el_token_de_google' }
      return this.http.post(this.apiUrl, { token: googleToken }).pipe(
        tap((response: any) => {
          // El backend devuelve { user: {...}, token: 'TU_JWT' }
          // Guardamos los datos del usuario devueltos por el backend
          this.saveUser(response.user);
          // Guardamos el token de sesión de la aplicación (JWT)
          this.saveAppToken(response.token);
          
          this.currentUserSubject.next(response.user);
        })
      );
  }

  loginManual(email: string, password: string): Observable<any> {
        return this.http.post(this.loginManualApiUrl, { email, password }).pipe(
            tap((response: any) => {
                // El backend devuelve { user: {...}, token: 'TU_JWT' }
                this.saveUser(response.user);
                this.saveAppToken(response.token);
                this.currentUserSubject.next(response.user);
            })
        );
  }

  // Guardar el token de la aplicación (para futuras peticiones protegidas)
  saveAppToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  //Guardar en localstorage
  saveUser(user: any) {
      localStorage.setItem(this.userKey, JSON.stringify(user)); // Usa this.userKey
  }

  getUser() {
      const data = localStorage.getItem(this.userKey); // CORRECCIÓN: Usar this.userKey ('userData')

      if (!data) {
          return null; // Retornar null si no hay datos reales, elimina el mock
      }

      try {
          return JSON.parse(data);
      } catch (e) {
          console.error('Error al parsear usuario:', e);
          return null;
      }
  }

  isAuthenticated(): boolean {
      const user = this.getUser();
      return !!user && !!this.getToken(); 
  }

  logout() {
    localStorage.removeItem(this.userKey);
      localStorage.removeItem(this.tokenKey); // Eliminar el token de la app
      this.currentUserSubject.next(null);
  }

  registro(formData: any): Observable<any> {
        // formData contiene: nombre, email, password, rol, etc.
        return this.http.post(this.registroApiUrl, formData).pipe(
            tap((response: any) => {
                console.log(`Usuario registrado en el backend. ID: ${response.id_registro}`);
            })
        );
  }
}