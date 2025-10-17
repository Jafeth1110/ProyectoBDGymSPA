import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowMembresiaComponent } from './show-membresia.component';

describe('ShowMembresiaComponent', () => {
  let component: ShowMembresiaComponent;
  let fixture: ComponentFixture<ShowMembresiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowMembresiaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowMembresiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});