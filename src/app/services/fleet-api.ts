import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface FleetDashboardStats {
  totalVehicles: number;
  compliantVehicles: number;
  unpaidInfractions: number;
  totalFuelConsumption: number;
  currentMonthFuelConsumption: number;
  detectedAnomalies: number;
  vehiclesAbsentInSage: number;
  vehiclesAbsentInNarsa: number;
}

export interface Vehicle {
  id?: number;
  matricule: string;
  normalizedMatricule?: string;
  marque?: string;
  modele?: string;
  type?: string;
  status?: string;
  sageReference?: string;
  narsaReference?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Driver {
  id?: number;
  fullName: string;
  phone?: string;
  cin?: string;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  status?: string;
}

export interface Infraction {
  id?: number;
  vehicleId?: number;
  driverId?: number;
  matricule?: string;
  driverName?: string;
  infractionDate?: string;
  location?: string;
  type?: string;
  amount?: number;
  paymentStatus?: string;
  reference?: string;
  notes?: string;
}

export interface FuelConsumption {
  id?: number;
  vehicleId?: number;
  driverId?: number;
  matricule?: string;
  driverName?: string;
  station?: string;
  consumptionDate?: string;
  liters?: number;
  amount?: number;
  receiptPhotoPath?: string;
  notes?: string;
}

export interface AutomationLog {
  id: number;
  workflowType: string;
  source: string;
  status: string;
  payload: string;
  message: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class FleetApiService {
  private apiBaseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<FleetDashboardStats> {
    return this.http.get<FleetDashboardStats>(`${this.apiBaseUrl}/dashboard/stats`);
  }

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiBaseUrl}/vehicles`);
  }

  createVehicle(vehicle: Vehicle): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.apiBaseUrl}/vehicles`, vehicle);
  }

  updateVehicle(vehicle: Vehicle): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.apiBaseUrl}/vehicles/${vehicle.id}`, vehicle);
  }

  deleteVehicle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/vehicles/${id}`);
  }

  getDrivers(): Observable<Driver[]> {
    return this.http.get<Driver[]>(`${this.apiBaseUrl}/drivers`);
  }

  createDriver(driver: Driver): Observable<Driver> {
    return this.http.post<Driver>(`${this.apiBaseUrl}/drivers`, driver);
  }

  updateDriver(driver: Driver): Observable<Driver> {
    return this.http.put<Driver>(`${this.apiBaseUrl}/drivers/${driver.id}`, driver);
  }

  deleteDriver(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/drivers/${id}`);
  }

  getInfractions(): Observable<Infraction[]> {
    return this.http.get<Infraction[]>(`${this.apiBaseUrl}/infractions`);
  }

  createInfraction(infraction: Infraction): Observable<Infraction> {
    return this.http.post<Infraction>(`${this.apiBaseUrl}/infractions`, infraction);
  }

  updateInfraction(infraction: Infraction): Observable<Infraction> {
    return this.http.put<Infraction>(`${this.apiBaseUrl}/infractions/${infraction.id}`, infraction);
  }

  deleteInfraction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/infractions/${id}`);
  }

  getFuelConsumptions(): Observable<FuelConsumption[]> {
    return this.http.get<FuelConsumption[]>(`${this.apiBaseUrl}/fuel-consumptions`);
  }

  createFuelConsumption(fuelConsumption: FuelConsumption): Observable<FuelConsumption> {
    return this.http.post<FuelConsumption>(`${this.apiBaseUrl}/fuel-consumptions`, fuelConsumption);
  }

  updateFuelConsumption(fuelConsumption: FuelConsumption): Observable<FuelConsumption> {
    return this.http.put<FuelConsumption>(
      `${this.apiBaseUrl}/fuel-consumptions/${fuelConsumption.id}`,
      fuelConsumption,
    );
  }

  uploadFuelReceipt(id: number, file: File): Observable<FuelConsumption> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<FuelConsumption>(`${this.apiBaseUrl}/fuel-consumptions/${id}/receipt`, formData);
  }

  deleteFuelConsumption(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/fuel-consumptions/${id}`);
  }

  getAutomationLogs(): Observable<AutomationLog[]> {
    return this.http.get<AutomationLog[]>(`${this.apiBaseUrl}/automations/logs`);
  }
}
