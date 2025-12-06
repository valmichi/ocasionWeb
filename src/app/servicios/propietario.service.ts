import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PropietarioService {

  private salones: any[] = [];

  getSalones() {
    return this.salones;
  }

  guardarSalon(salon: any) {
    if (!salon.id) {
      salon.id = Date.now();
      this.salones.push(salon);
    } else {
      const index = this.salones.findIndex(s => s.id === salon.id);
      this.salones[index] = salon;
    }
  }
}