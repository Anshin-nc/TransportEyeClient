import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';


const httpOptions = {
  headers: new HttpHeaders({
    Authorization: 'Basic bmV0Y3JhY2tlcjpuY3Bhc3N3b3Jk'
  })
};

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private authServerUrl = 'http://localhost:8901/';
  private authUrl = this.authServerUrl + 'oauth/token';
  private registerUrl = this.authServerUrl + 'api/v1/users/register';
  private activateUrl = this.authServerUrl + 'api/v1/users/activation/';
  private activateClientUrl = location.origin + '/activation';
  private recoverClientUrl = location.origin + '/recovery';
  private recoverUrl = this.authServerUrl + 'api/v1/users/password/recovery';
  private changePasswdUrl = this.authServerUrl + 'api/v1/users/password/change';
  private logoutUrl = this.authServerUrl + 'api/v1/token/revoke';


  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {
  }

  public login(username: any, password: any) {
    const body = new FormData();
    body.set('grant_type', 'password');
    body.set('username', username);
    body.set('password', password);
    return this.http.post<any>(this.authUrl, body, httpOptions);
  }

  public register(username: any, password: any, email: any) {
    const body = new FormData();
    body.set('email', email);
    body.set('username', username);
    body.set('password', password);
    body.set('client_link', this.activateClientUrl);
    return this.http.post(this.registerUrl, body, {responseType: 'text'});
  }

  public activate(uuid: string) {
    return this.http.put(this.activateUrl + uuid, {});
  }

  public recovery(username: string) {
    const body = new FormData();
    body.set('username', username);
    body.set('client_link', this.recoverClientUrl);
    return this.http.put(this.recoverUrl, body);
  }

  public resetPassword(uuid: string, passwd: string) {
    const body = new FormData();
    body.set('uuid', uuid);
    body.set('password', passwd);
    return this.http.put(this.changePasswdUrl, body);
  }

  public logout() {
    const bbody = new FormData();
    bbody.set('access_token', this.cookieService.get('access_token'));
    bbody.set('refresh_token', this.cookieService.get('refresh_token'));
    this.cookieService.delete('access_token');
    this.cookieService.delete('refresh_token');
    this.http.request('DELETE', this.logoutUrl, {body: bbody}).pipe(catchError(err => {
      return throwError(err);
    })).subscribe(() => {
      console.log('logout success');
    });
  }

  public prepareToken() { // todo: redirect to login or other logic on error catch
    if (!this.cookieService.check('access_token')) {
      if (this.cookieService.check('refresh_token')) {
        const body = new FormData();
        body.set('refresh_token', this.cookieService.get('refresh_token'));
        this.http.post<any>(this.authUrl, body, httpOptions)
          .pipe(catchError(err => {
            if (err.status === 400 || err.status === 401) {
              this.cookieService.delete('refresh_token');
              return throwError('Token expired');
            }
          })).subscribe(resp => {
          this.setCookies(resp);
        });
      } else { throwError('Token expired'); }
    }
  }

  public setCookies(resp) {
    this.cookieService.set('access_token', resp.access_token, new Date().getTime() + (1000 * resp.expires_in));
    this.cookieService.set('refresh_token', resp.refresh_token, new Date().getDate() + 30);
  }
}
