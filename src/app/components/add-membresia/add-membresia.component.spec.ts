import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMembresiaComponent } from './add-membresia.component';

describe('AddMembresiaComponent', () => {
  let component: AddMembresiaComponent;
  let fixture: ComponentFixture<AddMembresiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddMembresiaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMembresiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});