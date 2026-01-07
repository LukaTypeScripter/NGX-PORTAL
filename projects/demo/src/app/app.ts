import { Component, inject, signal } from '@angular/core';
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
  private readonly modal = inject(Modal);

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
}
