import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {ProfileComponent} from '../profile/profile.component';
import {ComponentsEventsService} from '../../services/components-events.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  providers: [ProfileComponent]
})


export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  private submitted: boolean;
  public message: string;
  hide = true;

  constructor(private router: Router,
              private formBuilder: FormBuilder,
              private authService: AuthService,
              private comp: ProfileComponent,
              private service: ComponentsEventsService
  ) {
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }

    this.authService.login(this.f.username.value, this.f.password.value)
      .pipe(catchError((error) => {
          if (error.status === 0) {
            this.message = 'Ошибка подключения';
          } else if (error.error instanceof ErrorEvent) {
            this.message = error.error.message;
          } else {
            this.message = error.error.error_description;
          }
          return throwError(this.message);
        })
      ).subscribe(resp => {
      this.authService.setCookies(resp);
      this.service.onLoginEvent.emit(this.f.username.value);
      this.router.navigate(['']);
    });
  }

  recoverPassword() {
    if (this.f.username.value === '') {
      this.message = 'Укажите логин для восстановления';
      return;
    }
    this.authService.recovery(this.f.username.value).pipe(catchError(error => {
      if (error.status === 0) {
        this.message = 'Ошибка подключения';
      } else if (error.status === 400) {
        this.message = 'Пользователь с таким логином не найден';
      } else if (error.error instanceof ErrorEvent) {
        this.message = error.error.message;
      } else {
        this.message = error.error.error_description;
      }
      return throwError(this.message);
    })).subscribe(() => {
      this.message = 'Письмо для изменения пароля отправлено на почту';
    });
  }
}

