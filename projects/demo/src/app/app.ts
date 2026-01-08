import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Modal } from '../../../ngx-portal/src/public-api';
import { TestModalComponent } from './test-modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('demo');
  protected readonly modal = inject(Modal);

  openModal(): void {
    const modalRef = this.modal.open(TestModalComponent, {
      width: '500px',
      data: { message: 'Hello from the app!', timestamp: new Date() },
      animationDuration: 400,
    });

    modalRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Modal closed with result:', result);
      } else {
        console.log('Modal closed without result');
      }
    });
  }

  openMultipleModals(): void {
    // Open 3 modals with different widths and data
    for (let i = 1; i <= 3; i++) {
      setTimeout(() => {
        const modalRef = this.modal.open(TestModalComponent, {
          width: `${400 + i * 50}px`,
          data: {
            message: `Modal #${i} - Stack Level: ${this.modal.openModalsCount()}`,
            timestamp: new Date()
          },
          animationDuration: 300,
        });

        console.log(`Opened modal ${i}. Total open modals: ${this.modal.openModalsCount()}`);

        modalRef.afterClosed().subscribe((result) => {
          console.log(`Modal ${i} closed. Remaining modals: ${this.modal.openModalsCount()}`, result);
        });
      }, i * 200);
    }
  }

  closeAllModals(): void {
    console.log(`Closing all ${this.modal.openModalsCount()} modals`);
    this.modal.closeAll();
  }
}
