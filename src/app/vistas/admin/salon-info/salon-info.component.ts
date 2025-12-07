import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PropietarioService } from '../../../servicios/propietario.service';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AuthService } from '../../../servicios/auth.service';

declare var google: any; // Declaración para evitar errores de TypeScript con el objeto global de Google Maps

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

  @Input() salon: any = null; // Recibe el salón para edición
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>(); // Evento para que AdminComponent recargue la lista

  idSalon: number = 0; // 0 significa nuevo salón
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

  formSalon: FormGroup; // Usamos FormGroup para el tipado

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private propietarioService: PropietarioService,
    private sanitizer: DomSanitizer,
    private authService: AuthService // Inyectamos AuthService para obtener el ID
  ) {
    // Definición de los FormControl con validadores
    this.formSalon = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      capacidad: [0, Validators.required],
      telefono: ['', Validators.required],
      // CORRECCIÓN: Asegurar el validador de email
      email: ['', [Validators.required, Validators.email]], 
      precioHora: [0, Validators.required],

      // Ubicación (Plana para el formulario, se anida en el payload)
      calle: ['', Validators.required],
      numero: ['', Validators.required],
      colonia: ['', Validators.required],
      ciudad: ['', Validators.required],
      estado: ['', Validators.required],
      pais: ['', Validators.required],
      cp: ['', Validators.required],

      // Disponibilidad
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],

      // Arrays de datos
      servicios: this.fb.control<string[]>([]),
      imagenes: this.fb.control<any[]>([]),
      mapa: [''] // Campo auxiliar para la URL del mapa
    });
  }

  ngOnInit(): void {
    // Inicialización y lógica de edición:
    // Si el componente recibe un objeto [salon] (modo Edición desde AdminComponent), 
    // ngOnChanges se encargará de rellenar el formulario.
    if (this.salon && this.salon.id) {
      this.idSalon = Number(this.salon.id);
      // Cargar valores a través de ngOnChanges
    } 

    // Si el componente se abre desde una ruta con ID (ej: /detalle-salon/5), 
    // se intenta cargar desde el servidor (aunque tu flujo primario es a través del Input).
    const idFromRoute = this.route.snapshot.paramMap.get('id');
    if (idFromRoute && Number(idFromRoute) > 0) {
      this.idSalon = Number(idFromRoute);
      this.cargarSalon(); 
    } 
    // Inicialización del mapa si lo requieres, con mecanismo de reintento
    // setTimeout(() => this.initMap(), 300);
  }

  // ngOnChanges se ejecuta cada vez que el Input [salon] cambia (ideal para modals)
  ngOnChanges(): void {
    if (this.salon && this.formSalon) {
      this.idSalon = Number(this.salon.id);
      this.patchFormValues(this.salon);
      this.updateMapaPreview();
      this.updateCalendarEvents(); // Actualizar eventos del calendario
    }
  }

  // Rellenar el formulario con datos anidados del salón
  patchFormValues(data: any): void {
    // Mapeo de campos planos
    this.formSalon.patchValue({
      nombre: data.nombre,
      descripcion: data.descripcion,
      capacidad: data.capacidad,
      telefono: data.telefono,
      email: data.email,
      precioHora: data.precioHora,
      
      // Mapeo de campos de Ubicación
      calle: data.ubicacion?.calle,
      numero: data.ubicacion?.numero,
      colonia: data.ubicacion?.colonia,
      ciudad: data.ubicacion?.ciudad,
      estado: data.ubicacion?.estado,
      pais: data.ubicacion?.pais,
      cp: data.ubicacion?.cp,

      // Mapeo de campos de Disponibilidad
      horaInicio: data.disponibilidad?.horaInicio,
      horaFin: data.disponibilidad?.horaFin,

      // Arrays
      servicios: data.servicios || [],
      imagenes: data.imagenes || [],
    });

    this.imagenesPreview = data.imagenes || [];
    this.formSalon.get('servicios')?.setValue(data.servicios || []);
    this.fechasOcupadas = data.disponibilidad?.fechasNoDisponibles || []; // Asegurar leer fechasNoDisponibles
    this.updateCalendarEvents();
  }

  // Función para cargar datos desde el servicio (Solo si se accede por URL y no por Input)
  cargarSalon(): void {
    if (this.idSalon <= 0 || isNaN(this.idSalon)) return; 

    this.propietarioService.getSalonById(this.idSalon).subscribe({
      next: data => {
        if (data) {
          this.salon = data;
          this.patchFormValues(data);
        }
      },
      error: err => console.error('Error al cargar salón por ID:', err)
    });
  }

  generarDireccionCompleta(): string {
    const f = this.formSalon.value;
    return `${f.calle} ${f.numero}, ${f.colonia}, ${f.ciudad}, ${f.estado}, ${f.pais}, ${f.cp}`;
  }

  updateMapaPreview(): void {
    const direccion = this.generarDireccionCompleta();

    if (!direccion.trim()) {
      this.mapaPreview = null;
      return;
    }

    // CORRECCIÓN URL MAPA: Se eliminó el '0' extra y se usa encodeURIComponent
    const url = `http://googleusercontent.com/maps.google.com/${encodeURIComponent(direccion)}&output=embed`;
    this.mapaPreview = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  updateCalendarEvents(): void {
    this.calendarOptions = {
      ...this.calendarOptions,
      events: this.fechasOcupadas.map(f => ({
        title: 'No disponible',
        start: f,
        display: 'background',
        backgroundColor: '#ff000055'
      }))
    };
  }

 guardar(): void {
    if (this.formSalon.invalid) {
        alert('Faltan datos obligatorios o el email es inválido.');
        // Marcar todos los campos como "touched" para mostrar los errores de validación
        this.formSalon.markAllAsTouched(); 
        return;
    }

    const user = this.authService.getUser();
    if (!user || !user.id) {
        alert('Error: ID de propietario no encontrado. Por favor, vuelve a iniciar sesión.');
        return;
    }

    // Lógica para diferenciar POST (Crear) de PUT (Actualizar)
    if (this.idSalon > 0) {
        this.guardarCambios(user.id.toString()); // PUT
    } else {
        this.crearSalon(user.id.toString()); // POST
    }
  }

  crearSalon(idPropietario: string): void {
    const f = this.formSalon.value;
    const direccion = this.generarDireccionCompleta();
    // Corregido: Plantilla de URL sin el '0' extra.
    const urlMapa = `http://googleusercontent.com/maps.google.com/${encodeURIComponent(direccion)}&output=embed`; 
    
    // CREACIÓN DEL PAYLOAD CON ESTRUCTURA ANIDADA
    const payload = {
        id_propietario: idPropietario, // CLAVE
        
        // Campos de nivel superior
        nombre: f.nombre,
        descripcion: f.descripcion,
        capacidad: f.capacidad,
        telefono: f.telefono,
        email: f.email,
        precioHora: f.precioHora,
        servicios: f.servicios,
        imagenes: f.imagenes,

        // OBJETO ANIDADO DE UBICACIÓN (¡CLAVE PARA EVITAR EL ERROR 400!)
        ubicacion: { 
            calle: f.calle,
            numero: f.numero,
            colonia: f.colonia,
            ciudad: f.ciudad,
            estado: f.estado,
            pais: f.pais,
            cp: f.cp,
            mapa: urlMapa 
        },

        // OBJETO ANIDADO DE DISPONIBILIDAD
        disponibilidad: {
            horaInicio: f.horaInicio,
            horaFin: f.horaFin,
            fechasNoDisponibles: this.fechasOcupadas,
        }
    };

    this.propietarioService.guardarSalon(payload).subscribe({
        next: (response) => {
            alert(`Salón "${response.salon.nombre}" publicado con ID ${response.id_salon}.`);
            this.guardado.emit(); 
            this.cerrar.emit();
        },
        error: (err) => {
            console.error('Error al guardar (POST) el salón:', err);
            alert(`Error al guardar: ${err.error?.error || 'Fallo de red/servidor'}`);
        }
    });
  }

  guardarCambios(idPropietario: string): void {
    const f = this.formSalon.value;
    const direccion = this.generarDireccionCompleta();
    // Corregido: Plantilla de URL sin el '0' extra.
    const urlMapa = `http://googleusercontent.com/maps.google.com/${encodeURIComponent(direccion)}&output=embed`; 
    
    // CREACIÓN DEL PAYLOAD CON ESTRUCTURA ANIDADA
    const payload = { 
        id: this.idSalon.toString(), // ID del salón que se actualiza
        id_propietario: idPropietario, // CLAVE

        // Campos de nivel superior
        nombre: f.nombre,
        descripcion: f.descripcion,
        capacidad: f.capacidad,
        telefono: f.telefono,
        email: f.email,
        precioHora: f.precioHora,
        servicios: f.servicios,
        imagenes: f.imagenes,

        ubicacion: { 
            calle: f.calle,
            numero: f.numero,
            colonia: f.colonia,
            ciudad: f.ciudad,
            estado: f.estado,
            pais: f.pais,
            cp: f.cp,
            mapa: urlMapa 
        },
        
        disponibilidad: {
            horaInicio: f.horaInicio,
            horaFin: f.horaFin,
            fechasNoDisponibles: this.fechasOcupadas,
        }
    };
    
    this.propietarioService.updateSalon(this.idSalon, payload).subscribe({
        next: () => {
            alert('Datos actualizados');
            this.guardado.emit(); 
            this.cerrar.emit();
        },
        error: err => {
            console.error('Error al actualizar (PUT):', err);
            alert(`Error al actualizar: ${err.error?.error || 'Fallo de red/servidor'}`);
        }
    });
  }
  
  // Manejo de servicios
  toggleServicio(event: any): void {
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

  // Manejo de imágenes (Se mantiene, solo guarda las referencias/Base64 en el form)
  onImagenesSeleccionadas(event: any): void {
    const archivos = event.target.files;
    this.imagenesPreview = [];
    for (let file of archivos) {
      const reader = new FileReader();
      reader.onload = e => this.imagenesPreview.push(e.target?.result as string); 
      reader.readAsDataURL(file);
    }
    this.formSalon.patchValue({ imagenes: archivos });
  }

  // Manejo de calendario
  onFechaClick(info: any): void {
    const fecha = info.dateStr;

    if (this.fechasOcupadas.includes(fecha)) {
      this.fechasOcupadas = this.fechasOcupadas.filter(f => f !== fecha);
    } else {
      this.fechasOcupadas.push(fecha);
    }

    this.updateCalendarEvents();
    this.formSalon.patchValue({ fechasOcupadas: this.fechasOcupadas });
  }
}