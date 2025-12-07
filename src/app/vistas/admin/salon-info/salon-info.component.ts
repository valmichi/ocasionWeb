import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PropietarioService } from '../../../servicios/propietario.service';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import { OnChanges } from '@angular/core';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-salon-info',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FullCalendarModule
  ],
  templateUrl: './salon-info.component.html',
  styleUrls: ['./salon-info.component.css']
})
export class SalonInfoComponent implements OnInit, OnChanges {

  @Input() salon: any = null;

  @Output() cerrar = new EventEmitter<void>();

  idSalon!: number;

  mapaPreview: SafeResourceUrl | null = null;

  imagenesPreview: string[] = [];
  fechasOcupadas: string[] = [];
  listaServicios = ['Estacionamiento', 'DJ', 'Utilería', 'Mobiliario', 'Iluminacion', 'Banquetes', "Meseros", "Catering", "Seguridad", "Pista de baile"];

  calendarOptions: any = {
  initialView: 'dayGridMonth',
  plugins: [dayGridPlugin, interactionPlugin],
  selectable: true,
  dateClick: this.onFechaClick.bind(this),
  events: []
};


  formSalon: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private propietarioService: PropietarioService,
    private sanitizer: DomSanitizer
  ) {

    // ---- SE CREA AQUÍ PARA EVITAR EL ERROR ----
    this.formSalon = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      capacidad: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', Validators.required],
      precioHora: ['', Validators.required],

      calle: ['', Validators.required],
      numero: ['', Validators.required],
      colonia: ['', Validators.required],
      ciudad: ['', Validators.required],
      estado: ['', Validators.required],
      pais: ['', Validators.required],
      cp: ['', Validators.required],

      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],

      // ---- TIPADOS CORRECTOS ----
      servicios: this.fb.control<string[]>([]),
      imagenes: this.fb.control<any[]>([]),

      mapa: ['']
    });
  }

  ngOnInit(): void {
    this.idSalon = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarSalon();
  }

  cargarSalon() {
  this.propietarioService.getSalonById(this.idSalon).subscribe({
    next: (data: any) => {

      // Normalizar datos
      data.servicios = data.servicios ?? [];
      data.imagenes = data.imagenes ?? [];
      data.fechasOcupadas = data.fechasOcupadas ?? [];

      this.salon = data;
      this.formSalon.patchValue(data);
      this.updateMapaPreview();
    },
    error: err => console.error(err)
  });
}

  generarDireccionCompleta(): string {
    const f = this.formSalon.value;
    return `${f.calle} ${f.numero}, ${f.colonia}, ${f.ciudad}, ${f.estado}, ${f.pais}, ${f.cp}`;
  }

  updateMapaPreview() {
    const direccion = this.generarDireccionCompleta();

    if (!direccion.trim()) {
      this.mapaPreview = null;
      return;
    }

    const url = `https://www.google.com/maps?q=${encodeURIComponent(direccion)}&output=embed`;
    this.mapaPreview = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

 guardar() {
  if (!this.idSalon) {
    alert("No se encontró el salón.");
    return;
  }

  this.guardarCambios();
}


  guardarCambios() {
    if (this.formSalon.invalid) {
      alert('Faltan datos obligatorios.');
      return;
    }

    const f = this.formSalon.value;
    const direccion = this.generarDireccionCompleta();
    const urlMapa = `https://www.google.com/maps?q=${encodeURIComponent(direccion)}&output=embed`;

    const payload = { 
      ...f,
      mapa: urlMapa,
      fechasOcupadas: this.fechasOcupadas
    };


    this.propietarioService.updateSalon(this.idSalon, payload).subscribe({
      next: () => alert('Datos actualizados'),
      error: err => console.error(err)
    });
  }

  toggleServicio(event: any) {
    const servicio = event.target.value;
    const checked = event.target.checked;

    const lista = [...this.formSalon.value.servicios];

    if (checked) {
      lista.push(servicio);
    } else {
      const i = lista.indexOf(servicio);
      if (i >= 0) lista.splice(i, 1);
    }

    this.formSalon.patchValue({ servicios: lista });
  }

  onImagenesSeleccionadas(event: any) {
    const archivos = event.target.files;

    this.imagenesPreview = [];

    for (let file of archivos) {
      const reader = new FileReader();
      reader.onload = e => this.imagenesPreview.push(e.target?.result as string);
      reader.readAsDataURL(file);
    }

    this.formSalon.patchValue({ imagenes: archivos });
  }

  ngOnChanges() {
  if (this.salon) {
    this.formSalon.patchValue(this.salon);
    this.updateMapaPreview();
  }
}

onFechaClick(info: any) {
  const fecha = info.dateStr;

  if (this.fechasOcupadas.includes(fecha)) {
    this.fechasOcupadas = this.fechasOcupadas.filter(f => f !== fecha);
  } else {
    this.fechasOcupadas.push(fecha);
  }

  this.calendarOptions = {
    ...this.calendarOptions,
    events: this.fechasOcupadas.map(f => ({
      title: 'No disponible',
      start: f,
      display: 'background',
      backgroundColor: '#ff000055'
    }))
  };

  this.formSalon.patchValue({ fechasOcupadas: this.fechasOcupadas });
}

}
