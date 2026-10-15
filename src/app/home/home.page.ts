import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  locationOutline,
  playCircleOutline,
  stopCircleOutline,
} from 'ionicons/icons';
import { LocationService } from '../services/location';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonIcon,
    IonTitle,
    IonToolbar,
  ],
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  readonly latitude = signal<number | null>(35.6619707);
  readonly longitude = signal<number | null>(139.703795);
  readonly errorMsg = signal<string | null>(null);
  readonly isTracking = signal(false);
  private watchId: string | null = null;

  constructor(private readonly locationService: LocationService) {
    addIcons({ locationOutline, playCircleOutline, stopCircleOutline });
  }

  async ngOnInit(): Promise<void> {
    await this.obtenerUbicacion();
  }

  async obtenerUbicacion(): Promise<void> {
    try {
      const position = await this.locationService.getCurrentPosition();
      this.latitude.set(position.coords.latitude);
      this.longitude.set(position.coords.longitude);
      this.errorMsg.set(null);
    } catch (error) {
      console.error('Error al obtener la ubicación:', error);
      this.errorMsg.set(
        'Error al obtener la ubicación. Asegúrate de que los permisos estén habilitados.',
      );
    }
  }

  async iniciarSeguimiento(): Promise<void> {
    if (this.isTracking()) {
      return;
    }

    try {
      this.watchId = await this.locationService.watchPosition(
        (position) => {
          this.latitude.set(position.coords.latitude);
          this.longitude.set(position.coords.longitude);
          this.errorMsg.set(null);
        },
        (error) => {
          console.error('Error durante el seguimiento:', error);
          this.errorMsg.set('No se pudo actualizar la ubicación.');
        },
      );
      this.isTracking.set(true);
      this.errorMsg.set(null);
    } catch (error) {
      console.error('Error al iniciar el seguimiento:', error);
      this.errorMsg.set(
        'No se pudo iniciar el seguimiento. Asegúrate de habilitar los permisos.',
      );
    }
  }

  async detenerSeguimiento(): Promise<void> {
    if (!this.watchId) {
      this.isTracking.set(false);
      return;
    }

    try {
      await this.locationService.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking.set(false);
    } catch (error) {
      console.error('Error al detener el seguimiento:', error);
      this.errorMsg.set('No se pudo detener el seguimiento.');
    }
  }

  ngOnDestroy(): void {
    if (this.watchId) {
      void this.locationService.clearWatch(this.watchId);
    }
  }
}
