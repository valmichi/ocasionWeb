import { Component } from '@angular/core';
import { SalonInfoComponent } from "./salon-info/salon-info.component";
import { PropietarioService } from '../../servicios/propietario.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [SalonInfoComponent, CommonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  salones: any[] = [];
  mostrarForm = false;
  salonSeleccionado: any = null;

  constructor(private propietarioService: PropietarioService) {}

  ngOnInit() {
    this.recargarSalones();
  }

  recargarSalones() {
    this.salones = this.propietarioService.getSalones(); // simulación de backend
  }

  nuevoSalon() {
    this.salonSeleccionado = null;
    this.mostrarForm = true;
  }

  editarSalon(salon: any) {
    this.salonSeleccionado = salon;
    this.mostrarForm = true;
  }

  cerrarFormulario() {
    this.mostrarForm = false;
  }
}
