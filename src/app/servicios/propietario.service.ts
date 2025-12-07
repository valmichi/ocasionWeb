// propietario.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

  getSalones(): Observable<any[]> {
    console.log('[FRONTEND] Solicitando lista de salones al backend...');
    return this.http.get<any>(`${this.apiUrl}/leer/salon/all`).pipe(
        // El backend devuelve { data: [...] }
        map(response => response.data || [])
    );
  }

  getSalonById(id: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/leer/salon/${id}`).pipe(
    map(response => response.data || null)
  );
}

updateSalon(id: number, salonData: any): Observable<any> {
  return this.http.put<any>(`${this.apiUrl}/actualizar/salon/${id}`, salonData);
}

}