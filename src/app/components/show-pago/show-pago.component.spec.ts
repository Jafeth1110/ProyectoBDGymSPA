import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowPagoComponent } from './show-pago.component';

describe('ShowPagoComponent', () => {
  let component: ShowPagoComponent;
  let fixture: ComponentFixture<ShowPagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowPagoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});