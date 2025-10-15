import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClaseComponent } from './add-clase.component';

describe('AddClaseComponent', () => {
  let component: AddClaseComponent;
  let fixture: ComponentFixture<AddClaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddClaseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddClaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});