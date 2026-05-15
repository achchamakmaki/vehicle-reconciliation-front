import { TestBed } from '@angular/core/testing';

import { VehicleReconciliation } from './vehicle-reconciliation';

describe('VehicleReconciliation', () => {
  let service: VehicleReconciliation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VehicleReconciliation);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
