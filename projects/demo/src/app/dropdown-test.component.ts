import { Component, inject } from '@angular/core';
import { JsonPipe, DatePipe } from '@angular/common';
import { DropDownRef, DROPDOWN_DATA } from '../../../ngx-portal/src/public-api';

@Component({
  selector: 'app-dropdown-test',
  standalone: true,
  imports: [JsonPipe, DatePipe],
  template: `
    <div class="dropdown-content">
      <h3>{{ data?.title || 'Dropdown Menu' }}</h3>

      @if (data?.description) {
        <p class="description">{{ data.description }}</p>
      }

      <div class="menu-items">
        <button class="menu-item" (click)="selectItem('Profile')">
          <span class="icon">👤</span>
          <span class="text">Profile</span>
        </button>
        <button class="menu-item" (click)="selectItem('Settings')">
          <span class="icon">⚙️</span>
          <span class="text">Settings</span>
        </button>
        <button class="menu-item" (click)="selectItem('Help')">
          <span class="icon">❓</span>
          <span class="text">Help</span>
        </button>
        <div class="divider"></div>
        <button class="menu-item danger" (click)="selectItem('Logout')">
          <span class="icon">🚪</span>
          <span class="text">Logout</span>
        </button>
      </div>

      @if (data?.showInfo) {
        <div class="info-section">
          <div class="info-item">
            <span class="label">Dropdown Level:</span>
            <span class="value">{{ dropdownRef.level }}</span>
          </div>
          @if (data?.timestamp) {
            <div class="info-item">
              <span class="label">Opened At:</span>
              <span class="value">{{ data.timestamp | date: 'short' }}</span>
            </div>
          }
        </div>
      }

      @if (data?.showFullData) {
        <details class="data-details">
          <summary>View Full Data</summary>
          <pre>{{ data | json }}</pre>
        </details>
      }
    </div>
  `,
  styles: [
    `
      .dropdown-content {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 0.5rem;
        min-width: 200px;
      }

      h3 {
        margin: 0 0 0.5rem 0;
        padding: 0.5rem;
        font-size: 1rem;
        color: #333;
        border-bottom: 1px solid #e0e0e0;
      }

      .description {
        margin: 0 0 0.5rem 0;
        padding: 0 0.5rem;
        color: #666;
        font-size: 0.75rem;
      }

      .menu-items {
        margin: 0;
      }

      .menu-item {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.625rem 0.75rem;
        border: none;
        background: transparent;
        cursor: pointer;
        border-radius: 4px;
        transition: background 0.15s;
        font-size: 0.875rem;
        color: #333;
        text-align: left;
      }

      .menu-item:hover {
        background: #f5f5f5;
      }

      .menu-item:active {
        background: #e0e0e0;
      }

      .menu-item.danger {
        color: #f44336;
      }

      .menu-item.danger:hover {
        background: #ffebee;
      }

      .icon {
        font-size: 1rem;
        width: 1.25rem;
        text-align: center;
      }

      .text {
        flex: 1;
      }

      .divider {
        height: 1px;
        background: #e0e0e0;
        margin: 0.25rem 0;
      }

      .info-section {
        margin-top: 0.5rem;
        padding: 0.5rem;
        background: #f9f9f9;
        border-radius: 4px;
        font-size: 0.75rem;
        border-top: 1px solid #e0e0e0;
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

      .data-details {
        margin: 0.5rem 0 0 0;
        padding: 0.5rem;
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
    `,
  ],
})
export class DropdownTestComponent {
  protected readonly dropdownRef = inject(DropDownRef<DropdownTestComponent, any>);
  protected readonly data = inject(DROPDOWN_DATA, { optional: true }) as any;

  selectItem(item: string): void {
    this.dropdownRef.close({
      action: 'select',
      item,
      timestamp: new Date(),
    });
  }
}
