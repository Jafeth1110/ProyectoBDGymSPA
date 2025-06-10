import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowTelefonousuarioComponent } from './show-telefonousuario.component';

describe('ShowTelefonousuarioComponent', () => {
  let component: ShowTelefonousuarioComponent;
  let fixture: ComponentFixture<ShowTelefonousuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowTelefonousuarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowTelefonousuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
