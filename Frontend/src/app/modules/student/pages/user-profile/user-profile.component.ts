import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { CourseService } from 'src/app/data/services/course.service';
import { QuizService } from 'src/app/data/services/quiz.service';
import { StudentService } from 'src/app/data/services/student.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  subscription2!: Subscription;

  modalDisplay: boolean = false;
  submitted: boolean = false;

  studentDetails: any;

  profileForm: FormGroup = this.fb.group({
    Name: ['', [Validators.required]],
    Email: ['', [Validators.required]],
    PhoneNumber: [''],
  });

  profileImage: any;
  @ViewChild('imageUpload') imageUpload: any;

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private spinner: NgxSpinnerService,
    private toast: ToastrService
  ) {}

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.subscription2) {
      this.subscription2.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.spinner.show();
    this.subscription = this.studentService.getProfile().subscribe({
      next: (response: any) => {
        console.log(response);
        this.studentDetails = response?.student;
        
        if(this.studentDetails?.profileImgUrl){
          this.profileImage = this.studentDetails.profileImgUrl;
        }

        this.spinner.hide();
      },
      error: (error) => {
        console.log(error);
        this.spinner.hide();
        this.toast.error(error.error.message);
      },
    });
  }

  get f() {
    return this.profileForm.controls;
  }

  updateProfile() {
    // print the form value
    console.log(this.profileForm.value);
    this.spinner.show();
    this.submitted = true;
    this.subscription2 = this.studentService
      .updateProfile(this.profileForm.value, this.profileImage)
      .subscribe({
        next: (response: any) => {
          console.log(response);
          const updatedStudent = response?.data?.Attributes;
          this.studentDetails = updatedStudent;

          this.profileForm.patchValue({
            Name: updatedStudent.Name,
            Email: updatedStudent.Email,
            PhoneNumber: updatedStudent.PhoneNumber,
          });

          if(updatedStudent?.profileImgUrl){
            this.profileImage = updatedStudent.profileImgUrl;
          }

          this.toast.success('Profile updated successfully');
          this.modalDisplay = false;
          this.spinner.hide();
        },
        error: (error) => {
          console.log(error);
          this.toast.error(error.error.message || 'Internal server error');
          this.modalDisplay = false;
          this.spinner.hide();
        },
      });
  }

  showModal() {
    this.modalDisplay = true;

    this.profileForm.patchValue({
      Name: this.studentDetails.Name?.S || this.studentDetails.Name,
      Email: this.studentDetails.Email?.S || this.studentDetails.Email,
      PhoneNumber:
        this.studentDetails.PhoneNumber?.S || this.studentDetails.PhoneNumber,
    });
  }

  myUploader(event: any) {
    if (event.files.length === 0) {
      return;
    }
    if (
      event.files[0].type !== 'image/jpeg' &&
      event.files[0].type !== 'image/png'
    ) {
      this.toast.error('Please upload a jpeg or png file');
      this.imageUpload.clear();
      return;
    }
    // if file size is greater than 1mb then show error
    if (event.files[0].size > 1000000) {
      this.toast.error('File size should be less than 1 MB');
      this.imageUpload.clear();
      return;
    }

    // convert file to base64
    const reader = new FileReader();
    reader.readAsDataURL(event.files[0]);
    reader.onload = (e) => {
      this.profileImage = reader.result;
    };
  }

  onProfileImageClear(event: any) {
    this.profileImage = '';
  }
}
