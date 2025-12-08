// propietario.service.ts
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class PropietarioService {
  private apiUrl = 'http://192.168.193.127:3000/api'; 
  private baseUrl = 'http://192.168.193.127:3000/api';
  
  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
        console.error('An error occurred:', error.error.message);
    } else {
        // El error ya cae aquí con la respuesta del servidor (e.g., 404, 500)
        console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
    }
    // Retornar un Observable con un mensaje de error para el componente
    return throwError(() => new Error('Fallo de red o del servidor.'));
  }

  guardarSalon(salonData: any): Observable<any> {
    console.log('[FRONTEND] Enviando datos del salón al backend...');
    return this.http.post(`${this.apiUrl}/salon`, salonData).pipe( 
        catchError(this.handleError.bind(this)) 
    );
  }

  getSalones(): Observable<any[]> {
    // const url = `${this.baseUrl}/leer/salon/all`; // Ya que baseUrl === apiUrl, usamos apiUrl
    const url = `${this.apiUrl}/salones/publico`;
    console.log('[FRONTEND] Solicitando lista de salones al backend...');
    return this.http.get<any>(url).pipe(
        map(response => response.data || []),
        catchError(this.handleError.bind(this)) 
    );
}

  getSalonById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/salon/${id}`).pipe(
        catchError(this.handleError.bind(this)) 
    );
  }

updateSalon(id: number, salonData: any): Observable<any> {
  console.log(`[FRONTEND] Enviando actualización de salón ID: ${id}...`);
  return this.http.put<any>(`${this.apiUrl}/actualizar/salon/${id}`, salonData).pipe(
        catchError(this.handleError.bind(this)) 
    );
}

getSalonesByPropietario(idPropietario: string): Observable<any[]> {
    console.log(`[FRONTEND] Solicitando salones para propietario ID: ${idPropietario}...`);
    return this.http.get<any[]>(`${this.apiUrl}/propietario/salones?id_propietario=${idPropietario}`).pipe(
        catchError(this.handleError.bind(this)) 
    );
}

}