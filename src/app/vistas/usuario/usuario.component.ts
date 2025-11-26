import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router} from '@angular/router'

@Component({
  selector: 'app-usuario',
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css'
})
export class UsuarioComponent {

  constructor(private router: Router) {}

 busqueda = '';
 filtroCapacidad = '';

 salones = [
    {
      id: 1,
    nombre: 'Salón Montecarlo',
    capacidad: 150,
    ubicacion: 'Col. Centro',
    img: '/salon1.jpg'
    },
    {
      id: 2,
    nombre: 'Salón Imperial',
    capacidad: 250,
    ubicacion: 'Col. Reforma',
    img: '/salon2.jpg'
    },
    {
      id: 3,
    nombre: 'Salón Diamante',
    capacidad: 350,
    ubicacion: 'Col. Jardines',
    img: '/salon3.jpg'
    }
    ];


    salonesFiltrados = [...this.salones];


filtrar() {
  const termino = this.removeAccents(this.busqueda);

  this.salonesFiltrados = this.salones.filter(s => {

    // Normalizamos el nombre del salón
    const nombreNormalizado = this.removeAccents(s.nombre);

    // Buscar sin acentos ni mayúsculas
    const coincideBusqueda =
      this.busqueda === '' || nombreNormalizado.includes(termino);

    // Filtrado por capacidad
    const coincideCapacidad = (() => {
      if (!this.filtroCapacidad) return true;
      const [min, max] = this.filtroCapacidad.split('-').map(Number);
      return s.capacidad >= min && s.capacidad <= max;
    })();

    return coincideBusqueda && coincideCapacidad;
  });
}

  verDetalles(salon: any) {
      this.router.navigate(['/detalle-salon', salon.id]);
  }

    logout() {
    console.log('Cerrar sesión');
    }

removeAccents(text: string): string {
    return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Elimina acentos
    .toLowerCase();
}

}
