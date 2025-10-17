import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateMetodopagoComponent } from './update-metodopago.component';

describe('UpdateMetodopagoComponent', () => {
  let component: UpdateMetodopagoComponent;
  let fixture: ComponentFixture<UpdateMetodopagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateMetodopagoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateMetodopagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});