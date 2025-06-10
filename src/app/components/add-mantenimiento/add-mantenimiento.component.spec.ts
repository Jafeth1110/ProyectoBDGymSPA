import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMantenimientoComponent } from './add-mantenimiento.component';

describe('AddMantenimientoComponent', () => {
  let component: AddMantenimientoComponent;
  let fixture: ComponentFixture<AddMantenimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMantenimientoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddMantenimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
