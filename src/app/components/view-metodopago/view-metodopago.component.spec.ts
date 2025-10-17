import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMetodopagoComponent } from './view-metodopago.component';

describe('ViewMetodopagoComponent', () => {
  let component: ViewMetodopagoComponent;
  let fixture: ComponentFixture<ViewMetodopagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewMetodopagoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewMetodopagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});