import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FleetApiService, Infraction } from '../../services/fleet-api';

@Component({
  selector: 'app-infractions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './infractions.html',
  styleUrl: './infractions.css',
})
export class InfractionsComponent implements OnInit {
  infractions: Infraction[] = [];
  form: Infraction = this.emptyForm();

  constructor(private fleetApi: FleetApiService) {}

  ngOnInit() {
    this.loadInfractions();
  }

  loadInfractions() {
    this.fleetApi.getInfractions().subscribe((infractions) => {
      this.infractions = infractions;
    });
  }

  save() {
    const request = this.form.id
      ? this.fleetApi.updateInfraction(this.form)
      : this.fleetApi.createInfraction(this.form);

    request.subscribe(() => {
      this.form = this.emptyForm();
      this.loadInfractions();
    });
  }

  edit(infraction: Infraction) {
    this.form = { ...infraction };
  }

  delete(id?: number) {
    if (!id) return;
    this.fleetApi.deleteInfraction(id).subscribe(() => this.loadInfractions());
  }

  private emptyForm(): Infraction {
    return {
      matricule: '',
      driverName: '',
      infractionDate: '',
      location: '',
      type: '',
      amount: 0,
      paymentStatus: 'NON_PAYE',
      reference: '',
      notes: '',
    };
  }
}
