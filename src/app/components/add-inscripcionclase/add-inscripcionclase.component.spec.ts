import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInscripcionClaseComponent } from './add-inscripcionclase.component';

describe('AddInscripcionClaseComponent', () => {
  let component: AddInscripcionClaseComponent;
  let fixture: ComponentFixture<AddInscripcionClaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddInscripcionClaseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddInscripcionClaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});