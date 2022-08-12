import { AbstractControl, ValidatorFn } from '@angular/forms';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl) => {
  const password: AbstractControl | null = control.get('password');
  const cPassword = control.get('confirmPassword');
    
  if(password && cPassword && password.value === cPassword.value) {
    return null;
  } else {
    return { passwordMatchError: true };
  }
}
