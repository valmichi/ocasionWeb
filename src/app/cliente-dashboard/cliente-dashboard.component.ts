import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropietarioService } from '../servicios/propietario.service';
import { RouterModule } from '@angular/router'; // Si tienes rutas de detalle

@Component({
  selector: 'app-cliente-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cliente-dashboard.component.html',
  styleUrls: ['./cliente-dashboard.component.css']
})
export class ClienteDashboardComponent implements OnInit {
  salones: any[] = [];
  isLoading: boolean = true;

  constructor(private propietarioService: PropietarioService) { }

  ngOnInit(): void {
    this.loadSalones();
  }

  loadSalones(): void {
    this.isLoading = true;
    this.propietarioService.getSalones().subscribe({
      next: (data: any) => { 
        this.salones = data;
        this.isLoading = false;
      },
      error: (err: any) => { 
        console.error('Error al cargar los salones para el cliente:', err);
        this.isLoading = false;
      }
    });
  }
  
  verDetalle(id: string): void {
    // Lógica para navegar a la vista de detalle del salón
    // Por ejemplo: this.router.navigate(['/salon', id]);
    alert(`Navegar a la vista de detalle del salón ID: ${id}`);
  }
}