import { Injectable } from '@angular/core';
import {
  Geolocation,
  PermissionStatus,
  Position,
} from '@capacitor/geolocation';

@Injectable({ providedIn: 'root' })
export class LocationService {
  async getCurrentPosition(): Promise<Position> {
    let permissions = await Geolocation.checkPermissions();

    if (!this.hasLocationPermission(permissions)) {
      permissions = await Geolocation.requestPermissions();
    }

    if (!this.hasLocationPermission(permissions)) {
      throw new Error('Location permission was not granted.');
    }

    return Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
    });
  }

  async watchPosition(
    onPosition: (position: Position) => void,
    onError: (error: unknown) => void,
  ): Promise<string> {
    let permissions = await Geolocation.checkPermissions();

    if (!this.hasLocationPermission(permissions)) {
      permissions = await Geolocation.requestPermissions();
    }

    if (!this.hasLocationPermission(permissions)) {
      throw new Error('Location permission was not granted.');
    }

    return Geolocation.watchPosition(
      { enableHighAccuracy: true },
      (position, error) => {
        if (error) {
          onError(error);
          return;
        }

        if (position) {
          onPosition(position);
        }
      },
    );
  }

  clearWatch(watchId: string): Promise<void> {
    return Geolocation.clearWatch({ id: watchId });
  }

  private hasLocationPermission(permissions: PermissionStatus): boolean {
    return (
      permissions.location === 'granted' ||
      permissions.coarseLocation === 'granted'
    );
  }
}
