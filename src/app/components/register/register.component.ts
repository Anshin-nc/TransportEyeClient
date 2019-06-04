import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
// import {Router} from '@angular/router';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.less']
})

export class RegisterComponent implements OnInit {
  regForm: FormGroup;
  private submitted: boolean;
  public message: any;
  hide = true;

  constructor(
    // private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    // private comp: SidebarComponent
  ) {
  }

  ngOnInit() {
    this.regForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() {
    return this.regForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.regForm.invalid) {
      return;
    }
    this.authService.register(this.f.username.value, this.f.password.value, this.f.email.value)
      .pipe(catchError((error) => {
          if (error.status === 0) {
            this.message = 'Ошибка подключения';
          } else if (error.status === 400) {
            this.message = '<ul>';
            error.error.split(',').forEach(el => {
              this.message += '<li>' + el + '</li>';
            });
            this.message += '</ul>';
          } else {
            this.message = 'Неизвестная ошибка';
          }
          return throwError(this.message);
        })
      ).subscribe(() => {
      this.message = 'Письмо было отправлено на почту';
    });
  }

  getMailError() {
    return this.f.email.errors.required ? 'Почта обязательна' :
      this.f.email.errors.email ? 'Неверный формат почты' :
        'Такого быть не должно';
  }
}
