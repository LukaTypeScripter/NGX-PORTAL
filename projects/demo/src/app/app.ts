import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  Modal,
  DragAndDropModalService,
  ModalResizeService,
  BottomSheet,
} from '../../../ngx-portal/src/public-api';
import { TestModalComponent } from './test-modal.component';
import { BottomSheetTestComponent } from './bottom-sheet-test.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('demo');
  protected readonly modal = inject(Modal);
  private readonly dragService = inject(DragAndDropModalService);
  private readonly resizeService = inject(ModalResizeService);
  protected readonly bottomSheet = inject(BottomSheet);

  openModal(): void {
    const modalRef = this.modal.open(TestModalComponent, {
      width: '500px',
      dragAndDrop: true,
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
          dragAndDrop: true,
          data: {
            message: `Modal #${i} - Stack Level: ${this.modal.openModalsCount()}`,
            timestamp: new Date(),
          },
          animationDuration: 300,
        });

        console.log(`Opened modal ${i}. Total open modals: ${this.modal.openModalsCount()}`);

        modalRef.afterClosed().subscribe((result) => {
          console.log(
            `Modal ${i} closed. Remaining modals: ${this.modal.openModalsCount()}`,
            result,
          );
        });
      }, i * 200);
    }
  }

  closeAllModals(): void {
    console.log(`Closing all ${this.modal.openModalsCount()} modals`);
    this.modal.closeAll();
  }

  openResizableModal(): void {
    const modalRef = this.modal.open(TestModalComponent, {
      width: '600px',
      height: '500px',
      data: {
        message: 'Resizable & Draggable Modal! Try dragging and resizing!',
        timestamp: new Date(),
      },
      animationDuration: 300,
    });

    // Enable resize with all handles
    this.resizeService.enableResize(modalRef, {
      minWidth: 400,
      minHeight: 300,
      maxWidth: window.innerWidth - 100,
      maxHeight: window.innerHeight - 100,
    });

    modalRef.afterClosed().subscribe((result) => {
      // Clean up
      this.dragService.destroyDragAndDropModal(modalRef);
      this.resizeService.disableResize(modalRef);

      if (result) {
        console.log('Resizable modal closed with result:', result);
      } else {
        console.log('Resizable modal closed without result');
      }
    });
  }

  // Bottom Sheet Examples

  openBasicBottomSheet(): void {
    const ref = this.bottomSheet.open(BottomSheetTestComponent, {
      data: {
        title: 'Basic Bottom Sheet',
        description: 'Default configuration with 50% and 100% snap points',
        message: 'Drag the handle up/down or swipe to dismiss!',
      },
    });

    ref.afterClosed().subscribe((result) => {
      console.log('Bottom sheet closed:', result);
    });
  }

  openMultiSnapBottomSheet(): void {
    const ref = this.bottomSheet.open(BottomSheetTestComponent, {
      data: {
        title: 'Multiple Snap Points',
        description: 'Three snap points: 30%, 60%, and 90% of screen height',
        message: 'Drag to different heights - it will snap to nearest point!',
      },
      snapPoints: [0.3, 0.6, 0.9],
      initialSnapPoint: 1,
    });

    ref.afterClosed().subscribe((result) => {
      console.log('Multi-snap bottom sheet closed:', result);
    });
  }

  openCustomSnapBottomSheet(): void {
    const ref = this.bottomSheet.open(BottomSheetTestComponent, {
      data: {
        title: 'Custom Snap Points',
        description: 'Mixed format: pixels, percentages, and vh units',
        message: 'Snap points: 300px, 50%, 80vh',
        showFullData: true,
      },
      snapPoints: ['300px', '50%', '80vh'],
      initialSnapPoint: 0,
    });

    ref.afterClosed().subscribe((result) => {
      console.log('Custom snap bottom sheet closed:', result);
    });
  }

  openNoDragBottomSheet(): void {
    const ref = this.bottomSheet.open(BottomSheetTestComponent, {
      data: {
        title: 'No Drag Handle',
        description: 'Drag disabled - use buttons to close',
        message: 'Cannot be dragged or swiped to dismiss',
      },
      enableDrag: false,
      snapPoints: [0.6],
    });

    ref.afterClosed().subscribe((result) => {
      console.log('No-drag bottom sheet closed:', result);
    });
  }

  openNoBackdropDismissBottomSheet(): void {
    const ref = this.bottomSheet.open(BottomSheetTestComponent, {
      data: {
        title: 'Cannot Dismiss on Backdrop',
        description: 'Backdrop click disabled and swipe dismiss disabled',
        message: 'Must use buttons to close',
      },
      disableClose: true,
      dismissOnSwipeDown: false,
      snapPoints: [0.5],
    });

    ref.afterClosed().subscribe((result) => {
      console.log('No-backdrop-dismiss bottom sheet closed:', result);
    });
  }

  openFastAnimationBottomSheet(): void {
    const ref = this.bottomSheet.open(BottomSheetTestComponent, {
      data: {
        title: 'Fast Animation',
        description: 'Animation duration: 150ms',
        message: 'Notice the quick open/close animations!',
      },
      animationDuration: 150,
      snapPoints: [0.5, 0.9],
    });

    ref.afterClosed().subscribe((result) => {
      console.log('Fast animation bottom sheet closed:', result);
    });
  }

  openSlowAnimationBottomSheet(): void {
    const ref = this.bottomSheet.open(BottomSheetTestComponent, {
      data: {
        title: 'Slow Animation',
        description: 'Animation duration: 800ms',
        message: 'Notice the slow, smooth animations',
      },
      animationDuration: 800,
      snapPoints: [0.4, 0.8],
    });

    ref.afterClosed().subscribe((result) => {
      console.log('Slow animation bottom sheet closed:', result);
    });
  }

  openStackedBottomSheets(): void {
    // Open first bottom sheet
    const ref1 = this.bottomSheet.open(BottomSheetTestComponent, {
      data: {
        title: 'First Bottom Sheet',
        description: 'Second sheet will open automatically',
        message: 'This demonstrates stacking of multiple bottom sheets',
      },
      snapPoints: [0.4],
      initialSnapPoint: 0,
    });

    // Wait a bit then open second
    setTimeout(() => {
      const ref2 = this.bottomSheet.open(BottomSheetTestComponent, {
        data: {
          title: 'Second Bottom Sheet',
          description: 'Stacked on top of the first one',
          message: 'Notice the z-index layering!',
        },
        snapPoints: [0.6],
        backdropClass: 'bottom-sheet-backdrop-stacked',
      });

      ref2.afterClosed().subscribe(() => {
        console.log('Second bottom sheet closed');
      });
    }, 500);

    ref1.afterClosed().subscribe(() => {
      console.log('First bottom sheet closed');
    });
  }

  openSensitiveSwipeBottomSheet(): void {
    const ref = this.bottomSheet.open(BottomSheetTestComponent, {
      data: {
        title: 'Sensitive Swipe Detection',
        description: 'Lower velocity threshold for snap/dismiss',
        message: 'Even gentle swipes will trigger snap behavior',
      },
      swipeVelocityThreshold: 0.2,
      dismissThreshold: 0.2,
      snapPoints: [0.4, 0.7],
    });

    ref.afterClosed().subscribe((result) => {
      console.log('Sensitive swipe bottom sheet closed:', result);
    });
  }

  dismissAllBottomSheets(): void {
    console.log(`Dismissing all ${this.bottomSheet.openBottomSheetsCount()} bottom sheets`);
    this.bottomSheet.dismissAll();
  }
}
