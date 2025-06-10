import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTelefonousuarioComponent } from './view-telefonousuario.component';

describe('ViewTelefonousuarioComponent', () => {
  let component: ViewTelefonousuarioComponent;
  let fixture: ComponentFixture<ViewTelefonousuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewTelefonousuarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewTelefonousuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
