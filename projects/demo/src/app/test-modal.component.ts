import { Component, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { ModalRef, MODAL_DATA, Modal } from '../../../ngx-portal/src/public-api';

@Component({
  selector: 'app-test-modal',
  standalone: true,
  template: `
    <div class="modal-content">
      <h2>Focus Trap Test Modal</h2>
      <p>
        Try pressing Tab to cycle through the focusable elements below. Focus should stay trapped
        within this modal!
      </p>

      @if (data) {
        <p>Data received: {{ data | json }}</p>
        <p style="font-size: 0.875rem; color: #666;">
          Modal ID: {{ modalRef.id }} | Level: {{ modalRef.level }}
        </p>
      }

      <div class="form-group">
        <label for="name">Name:</label>
        <input id="name" type="text" placeholder="Enter your name" />
      </div>

      <div class="form-group">
        <label for="email">Email:</label>
        <input id="email" type="email" placeholder="Enter your email" />
      </div>

      <div class="form-group">
        <label for="message">Message:</label>
        <textarea id="message" rows="3" placeholder="Enter a message"></textarea>
      </div>

      <div class="form-group">
        <a href="https://angular.dev" target="_blank">Angular Docs</a>
      </div>

      <div class="modal-actions">
        <button (click)="openNestedModal()" style="background: #28a745;">Open Nested Modal</button>
        <button (click)="close()">Close</button>
        <button (click)="closeWithResult()">Submit & Close</button>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-content {
        padding: 2rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        min-width: 400px;
        width: 100%;
        height: 100%;
      }

      h2 {
        margin-top: 0;
      }

      p {
        margin-bottom: 1rem;
        color: #666;
      }

      .form-group {
        margin-bottom: 1rem;
      }

      label {
        display: block;
        margin-bottom: 0.25rem;
        font-weight: 500;
        color: #333;
      }

      input,
      textarea {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-family: inherit;
        font-size: 0.875rem;
      }

      input:focus,
      textarea:focus {
        outline: 2px solid #007bff;
        outline-offset: 2px;
        border-color: #007bff;
      }

      a {
        color: #007bff;
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
      }

      a:focus {
        outline: 2px solid #007bff;
        outline-offset: 2px;
        border-radius: 2px;
      }

      .modal-actions {
        margin-top: 1.5rem;
        display: flex;
        gap: 1rem;
      }

      button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        background: #007bff;
        color: white;
        cursor: pointer;
        font-size: 0.875rem;
      }

      button:hover {
        background: #0056b3;
      }

      button:focus {
        outline: 2px solid #0056b3;
        outline-offset: 2px;
      }
    `,
  ],
  imports: [JsonPipe],
})
export class TestModalComponent {
  protected readonly modalRef = inject(
    ModalRef<TestModalComponent, { message: string; timestamp: Date }>,
  );
  protected readonly data = inject(MODAL_DATA, { optional: true });
  private readonly modalService = inject(Modal);

  close(): void {
    this.modalRef.close();
  }

  closeWithResult(): void {
    this.modalRef.close({ message: 'Modal closed with result!', timestamp: new Date() });
  }

  openNestedModal(): void {
    this.modalService.open(TestModalComponent, {
      width: '450px',
      data: {
        message: `Nested modal opened from ${this.modalRef.id}`,
        timestamp: new Date(),
      },
      animationDuration: 300,
    });
  }
}
