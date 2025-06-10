import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDetallemantenimientoComponent } from './add-detallemantenimiento.component';

describe('AddDetallemantenimientoComponent', () => {
  let component: AddDetallemantenimientoComponent;
  let fixture: ComponentFixture<AddDetallemantenimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDetallemantenimientoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddDetallemantenimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
