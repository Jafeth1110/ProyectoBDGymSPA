import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowMantenimientoComponent } from './show-mantenimiento.component';

describe('ShowMantenimientoComponent', () => {
  let component: ShowMantenimientoComponent;
  let fixture: ComponentFixture<ShowMantenimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowMantenimientoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowMantenimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
