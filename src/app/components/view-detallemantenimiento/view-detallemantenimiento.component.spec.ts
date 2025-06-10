import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDetallemantenimientoComponent } from './view-detallemantenimiento.component';

describe('ViewDetallemantenimientoComponent', () => {
  let component: ViewDetallemantenimientoComponent;
  let fixture: ComponentFixture<ViewDetallemantenimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDetallemantenimientoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewDetallemantenimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
