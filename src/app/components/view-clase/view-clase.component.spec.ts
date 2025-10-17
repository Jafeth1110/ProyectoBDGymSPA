import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewClaseComponent } from './view-clase.component';

describe('ViewClaseComponent', () => {
  let component: ViewClaseComponent;
  let fixture: ComponentFixture<ViewClaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewClaseComponent ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewClaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});