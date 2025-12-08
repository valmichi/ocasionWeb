import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { PropietarioService } from '../../servicios/propietario.service';

// FULLCALENDAR
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';

@Component({
  selector: 'app-detalle-salon',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './detalle-salon.component.html',
  styleUrl: './detalle-salon.component.css'
})

export class DetalleSalonComponent implements OnInit {
  salon: any = null;
  eventosOcupados: any[] = [];
  mapaSeguro: SafeResourceUrl | null = null;

  calendarOptions: any = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
    height: 500,
    events: [] 
  };

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private propietarioService: PropietarioService
  ) {}

  ngOnInit() {
    // Obtiene el ID de la URL
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : 0;
    
    if (id === 0 || isNaN(id)) {
        console.error("ID del salón inválido.");
        return;
    }

    // Cargar datos del backend
    this.propietarioService.getSalonById(id).subscribe({
        next: (data: any) => {
            if (!data) {
                console.error('Salón no encontrado.');
                return;
            }
            
            // Asignar datos del salón
            this.salon = data;

            // Mapear eventos de disponibilidad (usando el campo correcto del backend)
            this.eventosOcupados = data.disponibilidad?.fechasNoDisponibles?.map((fecha: string) => ({
                title: 'No disponible',
                start: fecha,
                display: 'background',
                backgroundColor: '#ff9999'
            })) || [];

            // Sanitizar URL del mapa (Asegúrate de que 'mapa' exista en la ubicación)
            const mapUrl = data.ubicacion?.mapa || 'about:blank';
            this.mapaSeguro = this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);

            // Actualizar calendario
            this.calendarOptions = {
                ...this.calendarOptions,
                events: this.eventosOcupados
            };
        },
        error: (err: any) => {
            console.error('Error al cargar el detalle del salón:', err);
            alert(`Error al cargar el salón: ${err.error?.error || 'Fallo de conexión'}`);
        }
    });
  }
}