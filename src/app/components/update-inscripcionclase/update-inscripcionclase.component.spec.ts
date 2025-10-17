import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateInscripcionclaseComponent } from './update-inscripcionclase.component';

describe('UpdateInscripcionclaseComponent', () => {
  let component: UpdateInscripcionclaseComponent;
  let fixture: ComponentFixture<UpdateInscripcionclaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateInscripcionclaseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateInscripcionclaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});