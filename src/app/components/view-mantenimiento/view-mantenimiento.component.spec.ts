import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMantenimientoComponent } from './view-mantenimiento.component';

describe('ViewMantenimientoComponent', () => {
  let component: ViewMantenimientoComponent;
  let fixture: ComponentFixture<ViewMantenimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewMantenimientoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewMantenimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
