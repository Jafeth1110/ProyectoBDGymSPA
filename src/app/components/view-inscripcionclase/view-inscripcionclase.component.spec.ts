import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewInscripcionclaseComponent } from './view-inscripcionclase.component';

describe('ViewInscripcionclaseComponent', () => {
  let component: ViewInscripcionclaseComponent;
  let fixture: ComponentFixture<ViewInscripcionclaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewInscripcionclaseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewInscripcionclaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});