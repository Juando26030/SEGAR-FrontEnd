import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recover-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './recover-form.component.html',
  styleUrl: './recover-form.component.css'
})
export class RecoverFormComponent implements OnInit {
  recoverForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  emailSent = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.recoverForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.recoverForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      // Simular llamada a API
      setTimeout(() => {
        this.isLoading = false;
        this.emailSent = true;
        console.log('Password recovery for:', this.recoverForm.value.email);
      }, 2000);
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.recoverForm.controls).forEach(key => {
      const control = this.recoverForm.get(key);
      control?.markAsTouched();
    });
  }
}
