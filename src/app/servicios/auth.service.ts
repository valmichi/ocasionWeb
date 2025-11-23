import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

    private userKey = 'userData';
    

    // para saber si el usuario está logueado
    private currentUserSubject = new BehaviorSubject<any>(this.getUser());
    
    // almacena temporalmente un usuario "logueado"
    mockUser: any = null;

  constructor() { }

  //Simulacion login (cambiar con backend)
  loginWithGoogle(mockData:any) {
    // Cuando haya backend será:
    // return this.http.post('API_URL/login-google', token);
    this.saveUser(mockData);
    this.currentUserSubject.next(mockData);
  }

  //Guardar en localstorage
  saveUser(user: any) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser() {
    const data = localStorage.getItem(this.userKey);
    return data ? JSON.parse(data) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getUser();
  }

  logout() {
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  loginMock(email: string, password: string) {
    if (email === 'admin@gmail.com' && password === '123') {
      return 'admin';
    } else if (email === 'user@gmail.com' && password === '123') {
      return 'user';
    } else {
      return null;
    }
  }

}
