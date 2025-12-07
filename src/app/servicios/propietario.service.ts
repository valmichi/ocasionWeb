// propietario.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PropietarioService {
  private apiUrl = 'http://192.168.193.127:3000/api'; 
  
  constructor(private http: HttpClient) { }

  guardarSalon(salonData: any): Observable<any> {
    // Llama al endpoint que gestiona ID y guarda en 'salon'
    console.log('[FRONTEND] Enviando datos del salón al backend...');
    return this.http.post(`${this.apiUrl}/salon`, salonData);
  }

  getSalones(): any[] { return []; /* Aquí va la llamada GET /api/leer/salon/all */ }
}