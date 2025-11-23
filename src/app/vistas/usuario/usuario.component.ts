import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuario',
  imports: [CommonModule],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css'
})
export class UsuarioComponent {

  currentSlide = 0;

  //Lista de salones simulada (cambiar con backend)
  salones = [
    {
      nombre: 'Salón Flores',
      img: '/salon1.jpg',
      desc: 'Un salón elegante ideal para juntas ejecutivas y conferencias.'
    },
    {
      nombre: 'Salón Diamante',
      img: '/salon2.jpg',
      desc: 'Un salón elegante ideal para juntas ejecutivas y conferencias.'
    },
    {
      nombre: 'Salón Buenavista',
      img: '/salon3.jpg',
      desc: 'Un salón elegante ideal para juntas ejecutivas y conferencias.'
    }
  ];

  //Logica del carrusel
  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.salones.length;
  }

  prevSlide() {
    this.currentSlide =
      (this.currentSlide - 1 + this.salones.length) % this.salones.length;
  }

  /** MODAL DE DETALLES */
  modalAbierto = false;
  salonSeleccionado: any = null;

  verDetalles(salon: any) {
    this.salonSeleccionado = salon;
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.salonSeleccionado = null;
  }
}
