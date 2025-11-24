import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

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
export class DetalleSalonComponent {

  salon: any = null;
  eventosOcupados: any[] = [];

  calendarOptions: any = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
    height: 500,
    events: []  // se llenará dinámicamente
  };

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    const salones = [
      {
        id: 1,
        nombre: 'Salón Montecarlo',
        descripcion: 'Un salón elegante perfecto para eventos sociales.',
        capacidad: 150,
        imgs: ['/detalle1.jpg','/detalle2.jpg','/detalle3.jpg'],
        // Fechas ocupadas simuladas
      fechas_ocupadas: [
        '2025-11-15',
        '2025-11-22',
        '2025-11-10'
      ],
        servicios: ['Clima', 'Audio profesional', 'Luces LED', 'Estacionamiento'],
        eventos: ['Bodas', 'XV años', 'Graduaciones', 'Empresariales'],
        mapa: 'https://www.google.com/maps/embed?...'
      }
    ];

    const data = salones.find(s => s.id === id);
    if (data) {
      this.salon = {
        ...data,
        mapaSeguro: this.sanitizer.bypassSecurityTrustResourceUrl(data.mapa)
      };
    }

    this.eventosOcupados = this.salon.fechas_ocupadas.map((fecha: string) => ({
      start: fecha,
      display: 'background',
      backgroundColor: '#ff9999'
    }));

    // ⭐ Se actualiza calendarOptions dinámicamente
    this.calendarOptions = {
      ...this.calendarOptions, // conserva la config inicial
      events: this.eventosOcupados
    };
  }
}
