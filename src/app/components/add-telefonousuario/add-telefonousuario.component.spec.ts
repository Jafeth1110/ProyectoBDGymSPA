import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTelefonousuarioComponent } from './add-telefonousuario.component';

describe('AddTelefonousuarioComponent', () => {
  let component: AddTelefonousuarioComponent;
  let fixture: ComponentFixture<AddTelefonousuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTelefonousuarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddTelefonousuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
