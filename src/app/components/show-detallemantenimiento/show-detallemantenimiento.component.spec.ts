import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowDetallemantenimientoComponent } from './show-detallemantenimiento.component';

describe('ShowDetallemantenimientoComponent', () => {
  let component: ShowDetallemantenimientoComponent;
  let fixture: ComponentFixture<ShowDetallemantenimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowDetallemantenimientoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowDetallemantenimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
