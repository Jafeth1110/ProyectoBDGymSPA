import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEquipoComponent } from './add-equipo.component';

describe('AddEquipoComponent', () => {
  let component: AddEquipoComponent;
  let fixture: ComponentFixture<AddEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEquipoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
