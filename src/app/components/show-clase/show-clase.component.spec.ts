import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowClaseComponent } from './show-clase.component';

describe('ShowClaseComponent', () => {
  let component: ShowClaseComponent;
  let fixture: ComponentFixture<ShowClaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowClaseComponent ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowClaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});