import {EventEmitter, Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ComponentsEventsService {

  onLoginEvent: EventEmitter<string> = new EventEmitter();
  constructor() { }
}
