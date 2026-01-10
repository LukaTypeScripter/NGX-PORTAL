# NGX-PORTAL

Angular library for creating beautiful modals and bottom sheets with advanced features like drag-and-drop, resizable modals, and gesture-based bottom sheets.

## Features

- **Modal Dialogs**: Customizable modal dialogs with backdrop and animations
- **Bottom Sheets**: Mobile-friendly bottom sheets with snap points
- **Drag & Drop**: Draggable and repositionable modals
- **Resizable**: Resizable modals with min/max constraints
- **Gesture Support**: Touch gestures for bottom sheets with velocity tracking
- **Snap Points**: Bottom sheets with multiple snap positions
- **Animations**: Smooth opening/closing animations
- **Accessibility**: Full keyboard navigation and ARIA support
- **Stack Management**: Multiple modals and proper z-index handling
- **Before Close Guards**: Prevent accidental closure with custom logic
- **TypeScript**: Full type safety and IntelliSense support

## Installation

```bash
npm install @lukaaaa/ngx-portal
```

**Peer Dependencies:**

```bash
npm install @angular/common @angular/core @angular/cdk
```

## Quick Start

### 1. Import the Module

```typescript
import { Component } from '@angular/core';
import { ModalService } from '@lukaaaa/ngx-portal';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(private modalService: ModalService) {}
}
```

### 2. Create a Modal Component

```typescript
import { Component, inject } from '@angular/core';
import { ModalRef } from '@lukaaaa/ngx-portal';

@Component({
  selector: 'app-example-modal',
  standalone: true,
  template: `
    <div class="modal-header">
      <h2>Example Modal</h2>
      <button (click)="close()">×</button>
    </div>
    <div class="modal-body">
      <p>Hello {{ data.name }}!</p>
    </div>
    <div class="modal-footer">
      <button (click)="close()">Cancel</button>
      <button (click)="submit()">Submit</button>
    </div>
  `,
  styles: [`
    .modal-header {
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-body {
      padding: 16px;
    }
    .modal-footer {
      padding: 16px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  `]
})
export class ExampleModalComponent {
  modalRef = inject(ModalRef<any, string>);
  data = this.modalRef.data;

  close() {
    this.modalRef.close();
  }

  submit() {
    this.modalRef.close('submitted');
  }
}
```

### 3. Open the Modal

```typescript
import { Component } from '@angular/core';
import { ModalService } from '@lukaaaa/ngx-portal';
import { ExampleModalComponent } from './example-modal.component';

@Component({
  selector: 'app-root',
  template: `
    <button (click)="openModal()">Open Modal</button>
  `
})
export class AppComponent {
  constructor(private modalService: ModalService) {}

  openModal() {
    const modalRef = this.modalService.open(ExampleModalComponent, {
      data: { name: 'World' },
      width: '500px',
      height: 'auto',
      hasBackdrop: true,
      backdropClass: 'modal-backdrop',
    });

    modalRef.afterClosed().subscribe(result => {
      console.log('Modal closed with result:', result);
    });
  }
}
```

## Modal Configuration

### Basic Configuration

```typescript
this.modalService.open(YourComponent, {
  width: '600px',
  height: '400px',
  minWidth: '300px',
  minHeight: '200px',
  maxWidth: '90vw',
  maxHeight: '90vh',
  hasBackdrop: true,
  backdropClass: 'custom-backdrop',
  panelClass: 'custom-panel',
  closeOnBackdropClick: true,
  closeOnEscape: true,
  data: { /* your data */ },
  animationEnabled: true,
  animationDuration: 300,
});
```

### Draggable Modal

```typescript
this.modalService.open(YourComponent, {
  width: '500px',
  draggable: true,
  dragHandleSelector: '.modal-header', // Optional: specify drag handle
});
```

### Resizable Modal

```typescript
this.modalService.open(YourComponent, {
  width: '600px',
  height: '400px',
  resizable: true,
  minWidth: '300px',
  minHeight: '200px',
  maxWidth: '1200px',
  maxHeight: '800px',
});
```

### Draggable & Resizable Modal

```typescript
this.modalService.open(YourComponent, {
  width: '600px',
  height: '400px',
  draggable: true,
  resizable: true,
  dragHandleSelector: '.modal-header',
  minWidth: '400px',
  minHeight: '300px',
});
```

### Before Close Guard

Prevent modal from closing with custom validation:

```typescript
const modalRef = this.modalService.open(YourComponent, {
  beforeClose: (result) => {
    if (result === 'discard') {
      return confirm('Are you sure you want to discard changes?');
    }
    return true;
  }
});
```

Or use async validation:

```typescript
const modalRef = this.modalService.open(YourComponent, {
  beforeClose: async (result) => {
    if (this.hasUnsavedChanges) {
      const confirmed = await this.showConfirmDialog();
      return confirmed;
    }
    return true;
  }
});
```

## Bottom Sheets

### Basic Bottom Sheet

```typescript
import { Component } from '@angular/core';
import { BottomSheetService } from '@lukaaaa/ngx-portal';

@Component({
  selector: 'app-root',
  template: `
    <button (click)="openBottomSheet()">Open Bottom Sheet</button>
  `
})
export class AppComponent {
  constructor(private bottomSheetService: BottomSheetService) {}

  openBottomSheet() {
    const sheetRef = this.bottomSheetService.open(YourSheetComponent, {
      data: { message: 'Hello from bottom sheet!' },
    });

    sheetRef.afterClosed().subscribe(result => {
      console.log('Bottom sheet closed:', result);
    });
  }
}
```

### Bottom Sheet with Snap Points

Create a bottom sheet that snaps to specific heights:

```typescript
this.bottomSheetService.open(YourSheetComponent, {
  snapPoints: [0.3, 0.6, 0.9], // 30%, 60%, 90% of screen height
  initialSnapIndex: 1, // Start at 60%
  hasBackdrop: true,
  closeOnBackdropClick: true,
});
```

### Snap Points with Different Units

```typescript
this.bottomSheetService.open(YourSheetComponent, {
  snapPoints: [
    '300px',    // Absolute pixels
    '50%',      // Percentage
    0.9,        // Decimal (90%)
    '80vh',     // Viewport height
  ],
  initialSnapIndex: 1,
});
```

### Bottom Sheet Configuration

```typescript
this.bottomSheetService.open(YourSheetComponent, {
  // Snap points
  snapPoints: [0.3, 0.6, 0.9],
  initialSnapIndex: 0,

  // Dismiss behavior
  dismissOnSwipeDown: true,
  dismissThreshold: 0.3, // Dismiss if dragged below 30% visible

  // Velocity settings
  velocityThreshold: 0.5, // px/ms threshold for momentum snap

  // Backdrop
  hasBackdrop: true,
  backdropClass: 'sheet-backdrop',
  closeOnBackdropClick: true,

  // Animation
  animationEnabled: true,
  animationDuration: 300,

  // Data
  data: { /* your data */ },
});
```

### Bottom Sheet Component Example

```typescript
import { Component, inject } from '@angular/core';
import { BottomSheetRef } from '@lukaaaa/ngx-portal';

@Component({
  selector: 'app-example-sheet',
  standalone: true,
  template: `
    <div class="bottom-sheet-container">
      <div class="drag-handle"></div>
      <div class="sheet-content">
        <h2>Bottom Sheet</h2>
        <p>{{ data.message }}</p>
        <button (click)="close()">Close</button>
      </div>
    </div>
  `,
  styles: [`
    .bottom-sheet-container {
      background: white;
      border-radius: 16px 16px 0 0;
      min-height: 200px;
    }
    .drag-handle {
      width: 40px;
      height: 4px;
      background: #ccc;
      border-radius: 2px;
      margin: 12px auto;
    }
    .sheet-content {
      padding: 0 16px 16px;
    }
  `]
})
export class ExampleSheetComponent {
  sheetRef = inject(BottomSheetRef<any, string>);
  data = this.sheetRef.data;

  close() {
    this.sheetRef.close('dismissed');
  }
}
```

## Modal Stack Management

Open multiple modals and manage the stack:

```typescript
// Open first modal
const modal1 = this.modalService.open(FirstComponent);

// Open second modal on top
const modal2 = this.modalService.open(SecondComponent);

// Close all modals
this.modalService.closeAll();

// Get the topmost modal
const topModal = this.modalService.getTopModal();
```

## Styling

### Custom Modal Styles

Add global styles or component-specific styles:

```css
/* Global styles */
.custom-backdrop {
  background-color: rgba(0, 0, 0, 0.7);
}

.custom-panel {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* Override default animations */
.modal-opening {
  animation: slideIn 0.3s ease-out;
}

.modal-closing {
  animation: slideOut 0.3s ease-in;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

### Custom Bottom Sheet Styles

```css
.bottom-sheet-container {
  background: white;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.1);
}

.bottom-sheet-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

.bottom-sheet-drag-handle {
  width: 40px;
  height: 4px;
  background: #d0d0d0;
  border-radius: 2px;
  margin: 12px auto;
  cursor: grab;
}

.bottom-sheet-drag-handle:active {
  cursor: grabbing;
}
```

## API Reference

### ModalService

#### Methods

- `open<T, D, R>(component: ComponentType<T>, config?: ModalConfig<D>): ModalRef<T, R>`
  - Opens a modal dialog
  - Returns a `ModalRef` to interact with the modal

- `closeAll(): void`
  - Closes all open modals

- `getTopModal(): ModalRef | null`
  - Returns the topmost modal in the stack

### ModalRef<T, R>

#### Methods

- `close(result?: R): void`
  - Closes the modal with an optional result

- `afterClosed(): Observable<R | undefined>`
  - Observable that emits when the modal is closed

- `updatePosition(position: { top?: string, left?: string }): void`
  - Updates modal position

- `updateSize(size: { width?: string, height?: string }): void`
  - Updates modal dimensions

#### Properties

- `data: D` - The data passed to the modal
- `componentInstance: T` - Reference to the component instance

### BottomSheetService

#### Methods

- `open<T, D, R>(component: ComponentType<T>, config?: BottomSheetConfig<D>): BottomSheetRef<T, R>`
  - Opens a bottom sheet
  - Returns a `BottomSheetRef` to interact with the sheet

### BottomSheetRef<T, R>

#### Methods

- `close(result?: R): void`
  - Closes the bottom sheet with an optional result

- `dismiss(result?: R): void`
  - Dismisses the bottom sheet (alias for close)

- `afterClosed(): Observable<R | undefined>`
  - Observable that emits when the sheet is closed

#### Properties

- `data: D` - The data passed to the bottom sheet
- `componentInstance: T` - Reference to the component instance

## Advanced Examples

### Confirmation Dialog

```typescript
import { Component, inject } from '@angular/core';
import { ModalRef } from '@lukaaaa/ngx-portal';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    <div class="confirm-dialog">
      <h2>{{ data.title }}</h2>
      <p>{{ data.message }}</p>
      <div class="actions">
        <button (click)="cancel()">{{ data.cancelText || 'Cancel' }}</button>
        <button (click)="confirm()" class="primary">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  modalRef = inject(ModalRef<any, boolean>);
  data = this.modalRef.data;

  cancel() {
    this.modalRef.close(false);
  }

  confirm() {
    this.modalRef.close(true);
  }
}

// Usage
const confirmed = await this.modalService
  .open(ConfirmDialogComponent, {
    data: {
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item?',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    },
    width: '400px',
  })
  .afterClosed()
  .toPromise();

if (confirmed) {
  // Proceed with deletion
}
```

### Image Gallery Bottom Sheet

```typescript
@Component({
  selector: 'app-gallery-sheet',
  standalone: true,
  template: `
    <div class="gallery-sheet">
      <div class="drag-handle"></div>
      <div class="images">
        <img *ngFor="let img of data.images" [src]="img" />
      </div>
    </div>
  `
})
export class GallerySheetComponent {
  sheetRef = inject(BottomSheetRef);
  data = this.sheetRef.data;
}

// Usage
this.bottomSheetService.open(GallerySheetComponent, {
  data: { images: ['url1.jpg', 'url2.jpg'] },
  snapPoints: [0.3, 0.6, 0.95],
  initialSnapIndex: 1,
});
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

## Author

Luka Lukashinjikashvili (lukashinjikashvili84@gmail.com)

## Repository

https://github.com/LukaTypeScripter/NGX-PORTAL

## Issues

https://github.com/LukaTypeScripter/NGX-PORTAL/issues
