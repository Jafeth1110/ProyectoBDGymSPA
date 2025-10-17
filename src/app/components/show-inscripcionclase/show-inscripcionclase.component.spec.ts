import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowInscripcionClaseComponent } from './show-inscripcionclase.component';

describe('ShowInscripcionClaseComponent', () => {
  let component: ShowInscripcionClaseComponent;
  let fixture: ComponentFixture<ShowInscripcionClaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowInscripcionClaseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowInscripcionClaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});