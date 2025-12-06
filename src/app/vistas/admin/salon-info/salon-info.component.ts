import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PropietarioService } from '../../../servicios/propietario.service';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FullCalendarModule } from '@fullcalendar/angular';

declare var google: any;

@Component({
  selector: 'app-salon-info',
  imports: [ReactiveFormsModule, CommonModule, FullCalendarModule],
  templateUrl: './salon-info.component.html',
  styleUrl: './salon-info.component.css'
})

export class SalonInfoComponent {
  @Input() salon: any;
  @Output() cerrar = new EventEmitter();
  @Output() guardado = new EventEmitter();

  formSalon!: FormGroup;
  listaServicios = ["Mobiliario", "Utilería", "DJ", "Pista de baile", "Catering", "Iluminación", "Estacionamiento", "Seguridad", "Banquetes", "Meseros"];
  imagenes: File[] = [];
  imagenesPreview: string[] = [];

  selectedServicios: string[] = [];
  fechasNoDisponibles: string[] = [];

  map: any;
  marker: any;
  mapaPreview: any = null;

  calendarOptions: CalendarOptions = {
  initialView: 'dayGridMonth',
  selectable: true,
  plugins: [dayGridPlugin],

  select: (info) => {
    const fecha = info.startStr;

    // Evitar duplicados
    if (!this.fechasNoDisponibles.includes(fecha)) {
      this.fechasNoDisponibles.push(fecha);
    }

    // mostrar evento en el calendario
    this.calendarOptions.events = this.fechasNoDisponibles.map(f => ({
      title: "No disponible",
      start: f,
      allDay: true,
      display: "background",
      backgroundColor: "#ff8a80"
    }));
  }
};

  constructor(
    private fb: FormBuilder,
    private propietarioService: PropietarioService
    , private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.formSalon = this.fb.group({
      id: [this.salon?.id],
      nombre: [this.salon?.nombre || ""],
      capacidad: [this.salon?.capacidad || ""],
      descripcion: [this.salon?.descripcion || ""],
      precioHora: [this.salon?.precioHora || ""],

      servicios: [this.salon?.servicios || []],

      direccion: [this.salon?.ubicacion?.direccion || ""],
      ciudad: [this.salon?.ubicacion?.ciudad || ""],
      cp: [this.salon?.ubicacion?.cp || ""],
      lat: [this.salon?.ubicacion?.lat || null],
      lng: [this.salon?.ubicacion?.lng || null],

      horaInicio: [this.salon?.disponibilidad?.horaInicio || ""],
      horaFin: [this.salon?.disponibilidad?.horaFin || ""],

      imagenes: [this.salon?.imagenes || []]
    });

    this.selectedServicios = this.formSalon.value.servicios || [];

    setTimeout(() => this.initMap(), 300);
  }

  toggleServicio(e: any) {
    const servicio = e.target.value;

    if (e.target.checked) {
      this.selectedServicios.push(servicio);
    } else {
      this.selectedServicios = this.selectedServicios.filter(s => s !== servicio);
    }

    this.formSalon.patchValue({ servicios: this.selectedServicios });
  }

 initMap() {
  const lat = this.formSalon.value.lat || 19.4326;
  const lng = this.formSalon.value.lng || -99.1332;

  this.map = new google.maps.Map(document.getElementById("map"), {
    center: { lat, lng },
    zoom: 14,
  });

  this.marker = new google.maps.Marker({
    position: { lat, lng },
    map: this.map,
    draggable: true,
  });

  //Cada que se mueva el pin, actualiza lat/lng y mapa preview
  this.marker.addListener("dragend", () => {
    const pos = this.marker.getPosition();

    this.formSalon.patchValue({
      lat: pos.lat(),
      lng: pos.lng()
    });

    this.updateMapaPreview();
  });

  //También genera mapa preview inicial
  this.updateMapaPreview();
}


  guardar() {
    const data = this.formSalon.value;

    this.propietarioService.guardarSalon({
      ...data,
      imagenes: this.imagenes,
      ubicacion: {
        direccion: data.direccion,
        ciudad: data.ciudad,
        cp: data.cp,
        lat: data.lat,
        lng: data.lng
      },
      disponibilidad: {
        fechasNoDisponibles: this.fechasNoDisponibles,
        horaInicio: data.horaInicio,
        horaFin: data.horaFin
      }
    });

    this.guardado.emit();
    this.cerrar.emit();
  }

  onImagenesSeleccionadas(event: any) {
  const files: FileList = event.target.files;

  this.imagenes = [];
  this.imagenesPreview = [];

  Array.from(files).forEach(file => {
    this.imagenes.push(file);

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagenesPreview.push(e.target.result);
    };
    reader.readAsDataURL(file);
  });

  // Guarda las imágenes en el form (en base64 / o nombres si usas backend)
  this.formSalon.patchValue({ imagenes: this.imagenes });
}

updateMapaPreview() {
  const direccion = this.generarDireccionCompleta();

  if (!direccion.trim()) return;

  const url = `https://www.google.com/maps?q=${encodeURIComponent(direccion)}&output=embed`;
  this.mapaPreview = this.sanitizer.bypassSecurityTrustResourceUrl(url);
}


generarDireccionCompleta() {
  const f = this.formSalon.value;

  return `${f.calle} ${f.numero}, ${f.colonia}, ${f.ciudad}, ${f.estado}, ${f.pais}, ${f.cp}`;
}


}
