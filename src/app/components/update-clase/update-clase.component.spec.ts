import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateClaseComponent } from './update-clase.component';

describe('UpdateClaseComponent', () => {
  let component: UpdateClaseComponent;
  let fixture: ComponentFixture<UpdateClaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateClaseComponent ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateClaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});