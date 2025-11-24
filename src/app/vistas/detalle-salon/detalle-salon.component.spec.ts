import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleSalonComponent } from './detalle-salon.component';

describe('DetalleSalonComponent', () => {
  let component: DetalleSalonComponent;
  let fixture: ComponentFixture<DetalleSalonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleSalonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleSalonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
