import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  formSubmitted: boolean = false;

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  constructor(private fb: FormBuilder, private authService: AuthService, private toast: ToastrService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
  }

  get formControl() {
    return this.loginForm.controls;
  }

  // implement login using cognito
  submitLoginForm() {
    this.formSubmitted = true;
    
    if (this.loginForm.invalid) {
      return;
    }

    this.spinner.show();
    this.authService.login(this.loginForm);
    
  }

}
