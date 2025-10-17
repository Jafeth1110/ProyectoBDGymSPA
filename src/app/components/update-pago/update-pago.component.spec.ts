import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePagoComponent } from './update-pago.component';

describe('UpdatePagoComponent', () => {
  let component: UpdatePagoComponent;
  let fixture: ComponentFixture<UpdatePagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdatePagoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdatePagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});