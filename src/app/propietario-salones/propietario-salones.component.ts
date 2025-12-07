// propietario-salones.component.ts (Crear nuevo archivo)

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalonInfoComponent } from '../vistas/admin/salon-info/salon-info.component';
import { PropietarioService } from '../servicios/propietario.service';
import { AuthService } from '../servicios/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-propietario-salones',
  standalone: true,
  imports: [CommonModule, SalonInfoComponent],
  templateUrl: './propietario-salones.component.html',
  styleUrls: ['./propietario-salones.component.css']
})
export class PropietarioSalonesComponent implements OnInit, OnDestroy {
  salones: any[] = [];
  isLoading: boolean = true;
  showEditModal: boolean = false;
  salonSeleccionado: any = null;
  private authSub: Subscription = new Subscription();
  private idPropietario: string = '';

  constructor(
    private propietarioService: PropietarioService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user && user.id) {
      this.idPropietario = user.id.toString();
      this.loadSalones();
    } else {
      console.error('Propietario no logueado.');
      this.isLoading = false;
    }
  }

  loadSalones(): void {
    this.isLoading = true;
    this.propietarioService.getSalonesByPropietario(this.idPropietario).subscribe({      
    next: (data: any) => { 
        this.salones = data;
        this.isLoading = false;
      },
      error: (err: any) => { 
        console.error('Error al cargar los salones del propietario:', err);
        this.isLoading = false;
      }
    });
  }
  
  openEditModal(salon: any | null): void {
    // Si salon es null, es modo creación
    this.salonSeleccionado = salon; 
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.salonSeleccionado = null;
  }
  
  onSalonGuardado(): void {
    // Esto se ejecuta cuando SalonInfoComponent emite (guardado)
    this.loadSalones();
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }
}