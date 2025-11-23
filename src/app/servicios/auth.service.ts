import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, map } from 'rxjs'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    private userKey = 'userData';
    private tokenKey = 'sessionToken'; 
    private apiUrl = '/api/auth';
    
    // Sujeto para rastrear el usuario logueado.
    private currentUserSubject = new BehaviorSubject<any>(this.getUser());
    
    // Observables para el estado
    public currentUser$ = this.currentUserSubject.asObservable();
    public isAuthenticated$ = this.currentUser$.pipe(
        map(user => !!user)
    );

    constructor(private http: HttpClient) { }

// MÉTODOS DE AUTENTICACIÓN REAL (Google Auth con Backend)

    loginWithGoogle(token: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/google`, { token: token }).pipe(
            tap(response => {
                this.saveUser(response.user); 
                this.saveToken(response.token);
                this.currentUserSubject.next(response.user);
            })
        );
    }

// MÉTODOS DE ALMACENAMIENTO

    //Guarda los datos del usuario en localStorage.
    saveUser(user: any) {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }
    
    //Guarda el token de sesión interno generado por el backend.
    saveToken(token: string) { 
        localStorage.setItem(this.tokenKey, token);
    }
    
    //Recupera los datos del usuario de localStorage.

    getUser() {
        const data = localStorage.getItem(this.userKey);
        return data ? JSON.parse(data) : null;
    }

    //Recupera el token de sesión de localStorage
    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

// MÉTODOS DE ESTADO Y CIERRE DE SESIÓN

    isAuthenticated(): boolean {
        return !!this.getUser();
    }

    logout() {
        localStorage.removeItem(this.userKey);
        localStorage.removeItem(this.tokenKey); 
        this.currentUserSubject.next(null);
    }

// MÉTODOS DE MOCK (PARA PRUEBAS SIN GOOGLE)
    loginMock(email: string, password: string) {
        let role: string | null = null;
        let mockData: any = null;

        if (email === 'admin@gmail.com' && password === '123') {
            role = 'admin';
            mockData = { name: "Admin Mock", email: email, role: role }; 
        } else if (email === 'user@gmail.com' && password === '123') {
            role = 'user';
            mockData = { name: "User Mock", email: email, role: role };
        }

        if (mockData) {
            this.saveUser(mockData);
            this.currentUserSubject.next(mockData);
        }
        return role;
    }
}