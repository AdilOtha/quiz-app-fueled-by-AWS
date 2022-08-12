import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
} from 'amazon-cognito-identity-js';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  ReplaySubject,
  Subscription,
} from 'rxjs';

const POOLDATA = {
  UserPoolId: environment.cognitoUserPoolId,
  ClientId: environment.cognitoAppClientId,
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // behaviourSubject to temporarily store username for confirmation
  username = new BehaviorSubject<string>('');
  private userDetailsSubject$ = new BehaviorSubject<any>(null);
  public userDetails$ = this.userDetailsSubject$.asObservable();

  private isAuthenticatedSubject$ = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject$.asObservable();

  private isUserDetailsLoadedSubject$ = new ReplaySubject<boolean>(1);
  public isUserDetailsLoaded$ = this.isUserDetailsLoadedSubject$.asObservable();

  public canAuthorizeRoute$: Observable<boolean> = combineLatest([
    this.isAuthenticated$,
    this.isUserDetailsLoaded$,
  ]).pipe(
    map((values: any[]) => {
      values.every((b) => b);
      return values[0] && values[1];
    })
  );

  constructor(
    private router: Router,
    private toast: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  // return user details
  getUserDetails(): Observable<any> {
    const userPool = new CognitoUserPool(POOLDATA);
    if (!userPool) {
      this.toast.error('Error while getting user details');
      return of(null);
    }
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      this.toast.error('Error while getting user details');
      return of(null);
    }
    // get user attributes using session
    cognitoUser.getSession((err: any, session: any) => {
      if (err) {
        this.toast.error(err.message);
        return;
      }
      // get user attributes
      cognitoUser.getUserAttributes((err, attributes) => {
        if (err) {
          this.toast.error(err.message);
          return;
        }
        // get user details
        const userDetails = {
          username: cognitoUser.getUsername(),
          attributes: attributes,
          session: session,
        };

        console.log(userDetails);
        

        this.userDetailsSubject$.next(userDetails);
        this.isUserDetailsLoadedSubject$.next(true);
      });
    });

    return this.userDetails$;
  }

  // check if user is logged in
  isLoggedIn(): Promise<boolean> {
    let loggedIn: boolean = false;

    const userPool = new CognitoUserPool(POOLDATA);

    const cognitoUser = userPool.getCurrentUser();

    return new Promise((resolve, reject) => {
      if (!cognitoUser) {
        resolve(false);
      }
      cognitoUser?.getSession((err: any, session: any) => {
        if (err) {
          this.toast.error(err.message);
          reject(err);
        } else {
          if (!session.isValid()) {
            console.log('Session expired');

            // refresh the session if possible
            const refreshToken = session.getRefreshToken().getToken();
            if (!refreshToken) {
              this.toast.error('Unable to refresh the session');
              reject(err);
            }
            cognitoUser.refreshSession(refreshToken, (err, session) => {
              if (err) {
                this.toast.error(err.message);
                reject(err);
              } else {
                console.log('Session refreshed');
                this.isAuthenticatedSubject$.next(true);
                loggedIn = true;
                resolve(loggedIn);
              }
            });
          } else {
            console.log('Session valid');
            this.isAuthenticatedSubject$.next(true);
            this.getUserDetails();
            loggedIn = true;
            resolve(loggedIn);
          }
        }
      });
    });
  }

  // sign up instructor
  signUpInstructor(instructorRegisterForm: FormGroup) {
    const userPool = new CognitoUserPool(POOLDATA);

    if (!userPool) {
      this.spinner.hide();
      this.toast.error('Error while signing up');
      return;
    }

    const attributeList = [];
    const attributeEmail = new CognitoUserAttribute({
      Name: 'email',
      Value: instructorRegisterForm.value.email,
    });
    attributeList.push(attributeEmail);

    const attributeRole = new CognitoUserAttribute({
      Name: 'custom:role',
      Value: instructorRegisterForm.value.role,
    });
    attributeList.push(attributeRole);

    // add phone number attribute
    const attributePhone = new CognitoUserAttribute({
      Name: 'phone_number',
      Value: instructorRegisterForm.value.phone_number,
    });
    attributeList.push(attributePhone);

    // add name attribute
    const attributeName = new CognitoUserAttribute({
      Name: 'name',
      Value: instructorRegisterForm.value.name,
    });
    attributeList.push(attributeName);

    userPool.signUp(
      instructorRegisterForm.value.email,
      instructorRegisterForm.value.password,
      attributeList,
      [],
      (err, result) => {
        if (err) {
          this.spinner.hide();
          this.toast.error(err.message);
          console.log(err);
          return;
        }
        const cognitoUser = result?.user;
        console.log('user name is ' + cognitoUser?.getUsername());
        this.spinner.hide();
        if (cognitoUser) {
          this.toast.info('Please confirm your email');
          // localStorage.setItem('username', cognitoUser?.getUsername());
          // store username in behaviourSubject
          this.username.next(cognitoUser?.getUsername());
          this.router.navigate(['/auth/confirm-registration']);
        } else {
          this.toast.error('Error while signing up');
        }
      }
    );
  }

  // sign up student
  signUpStudent(studentRegisterForm: FormGroup) {
    const userPool = new CognitoUserPool(POOLDATA);

    if (!userPool) {
      this.spinner.hide();
      this.toast.error('Error while signing up');
      return;
    }

    const attributeList = [];
    const attributeEmail = new CognitoUserAttribute({
      Name: 'email',
      Value: studentRegisterForm.value.email,
    });
    attributeList.push(attributeEmail);

    const attributeRole = new CognitoUserAttribute({
      Name: 'custom:role',
      Value: studentRegisterForm.value.role,
    });
    attributeList.push(attributeRole);

    // add phone number attribute
    const attributePhone = new CognitoUserAttribute({
      Name: 'phone_number',
      Value: studentRegisterForm.value.phone_number,
    });
    attributeList.push(attributePhone);

    // add name attribute
    const attributeName = new CognitoUserAttribute({
      Name: 'name',
      Value: studentRegisterForm.value.name,
    });
    attributeList.push(attributeName);

    userPool.signUp(
      studentRegisterForm.value.email,
      studentRegisterForm.value.password,
      attributeList,
      [],
      (err, result) => {
        if (err) {
          this.spinner.hide();
          this.toast.error(err.message);
          console.log(err);
          return;
        }
        const cognitoUser = result?.user;
        console.log('user name is ' + cognitoUser?.getUsername());
        this.spinner.hide();
        if (cognitoUser) {
          this.toast.info('Please confirm your email');
          // localStorage.setItem('username', cognitoUser?.getUsername());
          // store username in behaviourSubject
          this.username.next(cognitoUser?.getUsername());
          this.router.navigate(['/auth/confirm-registration']);
        } else {
          this.toast.error('Error while signing up');
        }
      }
    );
  }

  // confirm registration
  confirmRegistration(confirmRegistrationForm: FormGroup) {
    // get username from behaviourSubject
    const username = this.username.getValue();
    if (!username || username === '') {
      console.log('username not found');
      this.spinner.hide();
      this.toast.error('username not found');
      return;
    }

    const userPool = new CognitoUserPool(POOLDATA);

    if (!userPool) {
      this.spinner.hide();
      this.toast.error('Error while confirming registration');
      return;
    }

    // set verification code
    const userData = {
      Username: username,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    if (!cognitoUser) {
      this.spinner.hide();
      this.toast.error('Error while confirming registration');
      return;
    }

    // convert verfication code to string
    const verificationCode =
      confirmRegistrationForm.value.verificationCode.toString();

    cognitoUser.confirmRegistration(verificationCode, true, (err, result) => {
      this.spinner.hide();
      if (err) {
        this.toast.error(err.message);
        console.log(err);
        return;
      }
      this.toast.success('Registration confirmed');
      console.log('call result: ' + result);
      this.router.navigate(['/auth/login']);
    });
  }

  login(loginForm: FormGroup) {
    const userPool = new CognitoUserPool(POOLDATA);
    const userData = {
      Username: loginForm.value.email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    if (!cognitoUser) {
      this.spinner.hide();
      this.toast.error('Error while logging in');
      return;
    }

    const authenticationData = new AuthenticationDetails({
      Username: loginForm.value.email,
      Password: loginForm.value.password,
    });

    cognitoUser.authenticateUser(authenticationData, {
      onSuccess: (result) => {
        this.spinner.hide();
        this.toast.success('Login successful');

        this.isAuthenticatedSubject$.next(true);

        this.router.navigate(['/']);
      },
      onFailure: (err) => {
        this.spinner.hide();
        this.toast.error(err.message);
        console.log('login failed');
        console.log(err);

        this.isAuthenticatedSubject$.next(false);

        // if UserNotConfirmedException, then show confirmation code form
        if (err.code === 'UserNotConfirmedException') {
          // store username in behaviourSubject
          this.username.next(loginForm.value.email);
          this.router.navigate(['/auth/confirm-registration']);
        }
      },
    });
  }

  // redirect user based on role
  redirectUser() {    
    this.userDetails$.subscribe((userDetails: any) => {
      if (userDetails?.attributes) {
        // get user role
        const userRole = userDetails.attributes.find(
          (attribute: any) => attribute.getName() === 'custom:role'
        );
        console.log('userRole', userRole);

        if (!userRole) {
          return;
        }
        const userRoleValue = userRole.getValue();
        // check if user has the required role
        this.router.navigate([`/${userRoleValue}`]);
      }
    });
  }

  logout() {
    const userPool = new CognitoUserPool(POOLDATA);
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser != null) {
      cognitoUser.signOut();
    }
    this.isAuthenticatedSubject$.next(false);
    this.userDetailsSubject$.next(null);
    this.isUserDetailsLoadedSubject$.next(false);
    this.router.navigate(['/auth/login']);
  }
}
