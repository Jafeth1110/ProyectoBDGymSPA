import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateMembresiaComponent } from './update-membresia.component';

describe('UpdateMembresiaComponent', () => {
  let component: UpdateMembresiaComponent;
  let fixture: ComponentFixture<UpdateMembresiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateMembresiaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateMembresiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});