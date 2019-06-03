import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';

@Component({
  selector: 'app-activation',
  templateUrl: './activation.component.html',
  styleUrls: ['./activation.component.css']
})
export class ActivationComponent implements OnInit {
  message: string;
  success: boolean;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
  }

  ngOnInit() {
    this.authService.activate(this.route.snapshot.paramMap.get('uuid')).pipe(catchError((error) => {
        console.log(error.status);
        this.success = false;
        if (error.status === 0) {
          this.message = 'Ошибка подключения';
        } else if (error.status === 400) {
          this.message = 'Не удалось активировать аккаунт. Возможно, ссылка была повреждена';
        } else if (error.error instanceof ErrorEvent) {
          this.message = error.error.message;
        } else {
          this.message = error.error.error_description;
        }
        console.log(this.message);
        return throwError(this.message);
      })
    ).subscribe(() => {
      this.message = 'Аккаунт был активирован';
      this.success = true;
    });
  }

  getIconName() {
    return this.success ? 'mood' : 'mood_bad';
  }
}
