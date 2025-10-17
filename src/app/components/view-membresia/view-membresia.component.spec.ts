import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMembresiaComponent } from './view-membresia.component';

describe('ViewMembresiaComponent', () => {
  let component: ViewMembresiaComponent;
  let fixture: ComponentFixture<ViewMembresiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewMembresiaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewMembresiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});