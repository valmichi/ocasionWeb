import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PropietarioService } from '../../servicios/propietario.service';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css'
})

export class UsuarioComponent implements OnInit {

 constructor(private router: Router, private propietarioService: PropietarioService, private authService: AuthService) {} 

 busqueda = '';
 filtroCapacidad = '';
 salones: any[] = []; // Lista original de salones del backend
 salonesFiltrados: any[] = []; // Lista mostrada después del filtro
 isLoading: boolean = true; // Para la interfaz de usuario

 ngOnInit(): void {
  this.loadSalones();
 }

 loadSalones(): void {
  this.isLoading = true;
  
  // Llama al endpoint /api/leer/salon/all
  this.propietarioService.getSalones().subscribe({
    next: (data: any) => { 
      this.salones = data;
      this.filtrar();
      this.isLoading = false;
    },
    error: (err: any) => { 
      console.error('Error al cargar salones para el cliente:', err);
      this.isLoading = false;
    }
  });
 }

filtrar() {
 const termino = this.removeAccents(this.busqueda);

 // Filtramos sobre la lista REAL (this.salones)
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
   // Usamos salon.id, que ahora contiene el ID real del backend.
   this.router.navigate(['/detalle-salon', salon.id]); 
 }

 logout() {
    console.log('Cerrar sesión');
    this.authService.logout(); // Limpia localStorage y variables locales
    this.router.navigate(['/']); // Redirige al inicio (o login)
}

  removeAccents(text: string): string {
    return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Elimina acentos
    .toLowerCase();
  }
}