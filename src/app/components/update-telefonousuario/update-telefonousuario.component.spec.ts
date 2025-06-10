import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateTelefonousuarioComponent } from './update-telefonousuario.component';

describe('UpdateTelefonousuarioComponent', () => {
  let component: UpdateTelefonousuarioComponent;
  let fixture: ComponentFixture<UpdateTelefonousuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateTelefonousuarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateTelefonousuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
