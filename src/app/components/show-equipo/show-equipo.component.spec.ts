import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowEquipoComponent } from './show-equipo.component';

describe('ShowEquipoComponent', () => {
  let component: ShowEquipoComponent;
  let fixture: ComponentFixture<ShowEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowEquipoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
