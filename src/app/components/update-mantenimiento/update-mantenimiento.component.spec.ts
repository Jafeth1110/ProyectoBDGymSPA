import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateMantenimientoComponent } from './update-mantenimiento.component';

describe('UpdateMantenimientoComponent', () => {
  let component: UpdateMantenimientoComponent;
  let fixture: ComponentFixture<UpdateMantenimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateMantenimientoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateMantenimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
