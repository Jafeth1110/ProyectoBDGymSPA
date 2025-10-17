import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowMetodopagoComponent } from './show-metodopago.component';

describe('ShowMetodopagoComponent', () => {
  let component: ShowMetodopagoComponent;
  let fixture: ComponentFixture<ShowMetodopagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowMetodopagoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowMetodopagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});