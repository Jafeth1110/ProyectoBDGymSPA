import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateDetallemantenimientoComponent } from './update-detallemantenimiento.component';

describe('UpdateDetallemantenimientoComponent', () => {
  let component: UpdateDetallemantenimientoComponent;
  let fixture: ComponentFixture<UpdateDetallemantenimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateDetallemantenimientoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateDetallemantenimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
