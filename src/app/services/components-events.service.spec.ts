import {TestBed} from '@angular/core/testing';

import {ComponentsEventsService} from './components-events.service';

describe('ComponentsEventsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ComponentsEventsService = TestBed.get(ComponentsEventsService);
    expect(service).toBeTruthy();
  });
});
