import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
} from 'amazon-cognito-identity-js';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from 'src/app/auth/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-confirm-registration',
  templateUrl: './confirm-registration.component.html',
  styleUrls: ['./confirm-registration.component.scss'],
})
export class ConfirmRegistrationComponent implements OnInit {
  formSubmitted: boolean = false;

  confirmRegistrationForm: FormGroup = this.fb.group({
    verificationCode: ['', Validators.required],
  });

  constructor(private fb: FormBuilder, private authService: AuthService, private spinner: NgxSpinnerService) {}

  ngOnInit(): void {}

  submitForm() {
    this.formSubmitted = true;
    if (this.confirmRegistrationForm.invalid) {
      return;
    }
    console.log(this.confirmRegistrationForm.value);

    this.spinner.show();

    this.authService.confirmRegistration(this.confirmRegistrationForm);
  }

  get form() {
    return this.confirmRegistrationForm.controls;
  }
}
