import { Component, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { BottomSheetRef, BOTTOM_SHEET_DATA } from '../../../ngx-portal/src/public-api';

@Component({
  selector: 'app-bottom-sheet-test',
  standalone: true,
  imports: [JsonPipe],
  template: `
    <div class="bottom-sheet-content ">
      <div class="bottom-sheet-drag-handle"></div>

      <div class="content-inner">
        <h2>{{ data?.title || 'Bottom Sheet Test' }}</h2>

        @if (data?.description) {
          <p class="description">{{ data.description }}</p>
        }

        @if (data?.message) {
          <div class="message"><strong>Message:</strong> {{ data.message }}</div>
        }

        <div class="info-section">
          <div class="info-item">
            <span class="label">Bottom Sheet ID:</span>
            <span class="value">{{ bottomSheetRef.id }}</span>
          </div>
          <div class="info-item">
            <span class="label">Level:</span>
            <span class="value">{{ bottomSheetRef.level }}</span>
          </div>
          <div class="info-item">
            <span class="label">Current Snap Point:</span>
            <span class="value">{{ bottomSheetRef.currentSnapPointIndex }}</span>
          </div>
        </div>

        <div class="form-section">
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
            <textarea id="message" rows="3" placeholder="Type a message..."></textarea>
          </div>
        </div>

        @if (data?.showFullData) {
          <details class="data-details">
            <summary>View Full Data</summary>
            <pre>{{ data | json }}</pre>
          </details>
        }

        <div class="actions">
          <button class="btn btn-secondary" (click)="close()">Close</button>
          <button class="btn btn-primary" (click)="submit()">Submit</button>
          <button class="btn btn-danger" (click)="dismiss()">Dismiss</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .bottom-sheet-content {
        padding: 0;
        max-height: 90vh;
        overflow-y: auto;
      }

      .content-inner {
        padding: 1rem 1.5rem 1.5rem;
      }

      h2 {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
        color: #333;
      }

      .description {
        margin: 0 0 1rem 0;
        color: #666;
        font-size: 0.875rem;
      }

      .message {
        margin-bottom: 1rem;
        padding: 0.75rem;
        background: #e3f2fd;
        border-left: 3px solid #2196f3;
        border-radius: 4px;
        font-size: 0.875rem;
      }

      .info-section {
        margin: 1rem 0;
        padding: 0.75rem;
        background: #f5f5f5;
        border-radius: 4px;
        font-size: 0.875rem;
      }

      .info-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.25rem;
      }

      .info-item:last-child {
        margin-bottom: 0;
      }

      .label {
        font-weight: 500;
        color: #666;
      }

      .value {
        color: #333;
        font-family: monospace;
      }

      .form-section {
        margin: 1rem 0;
      }

      .form-group {
        margin-bottom: 1rem;
      }

      .form-group:last-child {
        margin-bottom: 0;
      }

      label {
        display: block;
        margin-bottom: 0.25rem;
        font-weight: 500;
        color: #333;
        font-size: 0.875rem;
      }

      input,
      textarea {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-family: inherit;
        font-size: 0.875rem;
        box-sizing: border-box;
      }

      input:focus,
      textarea:focus {
        outline: none;
        border-color: #2196f3;
        box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
      }

      textarea {
        resize: vertical;
      }

      .data-details {
        margin: 1rem 0;
        padding: 0.75rem;
        background: #f9f9f9;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        font-size: 0.75rem;
      }

      summary {
        cursor: pointer;
        font-weight: 500;
        color: #666;
        user-select: none;
      }

      pre {
        margin: 0.5rem 0 0 0;
        padding: 0.5rem;
        background: #fff;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 0.75rem;
      }

      .actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 1.5rem;
      }

      .btn {
        flex: 1;
        padding: 0.75rem 1rem;
        border: none;
        border-radius: 4px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .btn:active {
        transform: translateY(0);
      }

      .btn-primary {
        background: #2196f3;
        color: white;
      }

      .btn-primary:hover {
        background: #1976d2;
      }

      .btn-secondary {
        background: #757575;
        color: white;
      }

      .btn-secondary:hover {
        background: #616161;
      }

      .btn-danger {
        background: #f44336;
        color: white;
      }

      .btn-danger:hover {
        background: #d32f2f;
      }
    `,
  ],
})
export class BottomSheetTestComponent {
  protected readonly bottomSheetRef = inject(BottomSheetRef<BottomSheetTestComponent, any>);
  protected readonly data = inject(BOTTOM_SHEET_DATA, { optional: true }) as any;

  close(): void {
    this.bottomSheetRef.close();
  }

  dismiss(): void {
    this.bottomSheetRef.dismiss();
  }

  submit(): void {
    this.bottomSheetRef.close({
      action: 'submit',
      timestamp: new Date(),
      sheetId: this.bottomSheetRef.id,
    });
  }
}
