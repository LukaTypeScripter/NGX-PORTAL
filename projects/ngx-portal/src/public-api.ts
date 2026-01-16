/*
 * Public API Surface of ngx-portal
 */

export * from './lib/ngx-portal';

// Modal
export * from './lib/modal/modal';
export * from './lib/modal/modal-ref';
export * from './lib/modal/modal-config';

// Modal services (optional, for advanced usage)
export * from './lib/modal/services/modal-stack-manager.service';
export * from './lib/modal/services/modal-animation.service';
export * from './lib/modal/services/modal-accessibility.service';
export * from './lib/modal/services/modal-overlay.service';
export * from './lib/modal/services/drag-and-drop-modal.service';
export * from './lib/modal/services/modal-resize.service';

// Shared infrastructure (for advanced usage and bottom sheet implementation)
export * from './lib/shared/portal-ref-base';
export * from './lib/shared/portal-config-base';
export * from './lib/shared/services/portal-overlay.service';
export * from './lib/shared/services/portal-accessibility.service';
export * from './lib/shared/services/portal-stack-manager.service';

// Bottom Sheet
export * from './lib/bottom-sheet/bottom-sheet';
export * from './lib/bottom-sheet/bottom-sheet-ref';
export * from './lib/bottom-sheet/bottom-sheet-config';

// DropDown
export * from './lib/drop-down/drop-down';
export * from './lib/drop-down/drop-down-ref';
export * from './lib/drop-down/drop-down-config';
