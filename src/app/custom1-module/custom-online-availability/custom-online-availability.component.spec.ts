import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomOnlineAvailabilityComponent } from './custom-online-availability.component';

describe('CustomOnlineAvailabilityComponent', () => {
  let component: CustomOnlineAvailabilityComponent;
  let fixture: ComponentFixture<CustomOnlineAvailabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomOnlineAvailabilityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomOnlineAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
