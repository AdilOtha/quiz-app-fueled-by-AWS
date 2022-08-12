import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { passwordMatchValidator } from 'src/app/shared/validators/password-match.validator';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  instructorRegisterForm: FormGroup = this.fb.group(
    {
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
      phone_number: ['', [Validators.required, Validators.minLength(12)]],
      role: ['instructor'],
    },
    { validators: [passwordMatchValidator] }
  );

  studentRegisterForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    phone_number: ['', [Validators.required, Validators.minLength(12)]],
    role: ['student'],
  }, { validators: [passwordMatchValidator] });

  instructorFormSubmitted: boolean = false;

  studentFormSubmitted: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService, private toast: ToastrService, private spinner: NgxSpinnerService) {}

  ngOnInit(): void {}

  get instructorForm() {
    return this.instructorRegisterForm.controls;
  }

  get studentForm() {
    return this.studentRegisterForm.controls;
  }

  submitInstructorForm() {
    this.instructorFormSubmitted = true;
    console.error(this.instructorForm['password'].errors);

    console.log(this.instructorRegisterForm.value);

    if (this.instructorRegisterForm.invalid) {
      return;
    }

    this.spinner.show();

    this.authService.signUpInstructor(this.instructorRegisterForm);
  }  

  submitStudentForm() {
    this.studentFormSubmitted = true;    

    console.log(this.studentRegisterForm.value);

    if (this.studentRegisterForm.invalid) {
      return;
    }

    this.spinner.show();

    this.authService.signUpStudent(this.studentRegisterForm);
  }
}
