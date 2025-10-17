import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPagoComponent } from './view-pago.component';

describe('ViewPagoComponent', () => {
  let component: ViewPagoComponent;
  let fixture: ComponentFixture<ViewPagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPagoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});