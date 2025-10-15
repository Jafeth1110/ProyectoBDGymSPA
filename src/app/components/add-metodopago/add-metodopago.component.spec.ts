import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMetodoPagoComponent } from './add-metodopago.component';

describe('AddMetodoPagoComponent', () => {
  let component: AddMetodoPagoComponent;
  let fixture: ComponentFixture<AddMetodoPagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddMetodoPagoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMetodoPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});