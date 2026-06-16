import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface FleetDashboardStats {
  totalNarsaVehicles?: number;
  totalSageVehicles?: number;
  matchCount?: number;
  absentInSageCount?: number;
  absentInNarsaCount?: number;
  totalVehicles?: number;
  compliantVehicles?: number;
  unpaidInfractions?: number;
  totalFuelAmount?: number;
  monthlyFuelAmount?: number;
  fuelAnomaliesCount?: number;
  totalFuelConsumption?: number;
  currentMonthFuelConsumption?: number;
  detectedAnomalies?: number;
  vehiclesAbsentInSage?: number;
  vehiclesAbsentInNarsa?: number;
}

export interface Vehicle {
  id?: number;
  matricule: string;
  normalizedMatricule?: string;
  sageCode?: string;
  marque?: string;
  modele?: string;
  type?: string;
  status?: string;
  source?: string;
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
  normalizedMatricule?: string;
  driverName?: string;
  infractionDate?: string;
  location?: string;
  owner?: string;
  tenant?: string;
  type?: string;
  amount?: number;
  points?: number;
  paymentStatus?: string;
  reference?: string;
  status?: string;
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
  fuelTime?: string;
  invoiceNumber?: string;
  product?: string;
  liters?: number;
  unitPrice?: number;
  amount?: number;
  paymentMethod?: string;
  receiptPhotoPath?: string;
  receiptPhotoUrl?: string;
  status?: string;
  source?: string;
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

  getRecentFuelConsumptions(): Observable<FuelConsumption[]> {
    return this.http.get<FuelConsumption[]>(`${this.apiBaseUrl}/dashboard/recent-fuel-consumptions`);
  }

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiBaseUrl}/vehicles`);
  }

  getSageX3Vehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiBaseUrl}/vehicles/sage-x3`);
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

  uploadInfractions(file: File): Observable<{ imported: number }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ imported: number }>(`${this.apiBaseUrl}/infractions/upload`, formData);
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

  getFuelReceipt(id: number): Observable<Blob> {
    return this.http.get(`${this.apiBaseUrl}/fuel-consumptions/${id}/receipt`, {
      responseType: 'blob',
    });
  }

  deleteFuelConsumption(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/fuel-consumptions/${id}`);
  }

  getAutomationLogs(): Observable<AutomationLog[]> {
    return this.http.get<AutomationLog[]>(`${this.apiBaseUrl}/automations/logs`);
  }
}
