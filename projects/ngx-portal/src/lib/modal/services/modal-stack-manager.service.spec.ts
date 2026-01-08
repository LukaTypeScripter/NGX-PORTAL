import { TestBed } from "@angular/core/testing";
import { ModalStackManager } from "./modal-stack-manager.service";
import { ModalRef } from "../modal-ref";
import { OverlayRef } from "@angular/cdk/overlay";
import { vi } from 'vitest';
import { createModalRefMock } from "../test-helper";
describe('ModalStackManager', () => {
  let service: ModalStackManager;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModalStackManager]
    });
    service = TestBed.inject(ModalStackManager);
  });

  describe('generateModalId', () => {
    it('should generate unique modal IDs', () => {
      const id1 = service.generateModalId();
      const id2 = service.generateModalId();
      const id3 = service.generateModalId();

      expect(id1).toBe('modal-1');
      expect(id2).toBe('modal-2');
      expect(id3).toBe('modal-3');
    });

    it('should increment counter for each ID', () => {
      const ids = Array.from({ length: 5 }, () => service.generateModalId());

      expect(ids).toEqual(['modal-1', 'modal-2', 'modal-3', 'modal-4', 'modal-5']);
    });
  });

  describe('addToStack', () => {
    it('should add modal to stack and return level 0 for first modal', () => {
      const modalRef = createModalRefMock();

      const level = service.addToStack(modalRef);

      expect(level).toBe(0);
      expect(service.getStackSize()).toBe(1);
    });

    it('should return correct level for multiple modals', () => {
      const modal1 = createModalRefMock('modal-1');
      const modal2 = createModalRefMock('modal-2');
      const modal3 = createModalRefMock('modal-3');

      const level1 = service.addToStack(modal1);
      const level2 = service.addToStack(modal2);
      const level3 = service.addToStack(modal3);

      expect(level1).toBe(0);
      expect(level2).toBe(1);
      expect(level3).toBe(2);
    });

    it('should update modal count signal', () => {
      const modalRef = createModalRefMock();

      expect(service.openModalsCount()).toBe(0);

      service.addToStack(modalRef);

      expect(service.openModalsCount()).toBe(1);
    });
  });

  describe('removeFromStack', () => {
    it('should remove modal from stack', () => {
      const modalRef = createModalRefMock();
      service.addToStack(modalRef);

      expect(service.getStackSize()).toBe(1);

      service.removeFromStack(modalRef);

      expect(service.getStackSize()).toBe(0);
    });

    it('should update modal count signal after removal', () => {
      const modalRef = createModalRefMock();
      service.addToStack(modalRef);

      expect(service.openModalsCount()).toBe(1);

      service.removeFromStack(modalRef);

      expect(service.openModalsCount()).toBe(0);
    });

    it('should handle removing non-existent modal gracefully', () => {
      const modalRef = createModalRefMock();

      expect(() => service.removeFromStack(modalRef)).not.toThrow();
      expect(service.getStackSize()).toBe(0);
    });

    it('should remove correct modal from middle of stack', () => {
      const modal1 = createModalRefMock('modal-1');
      const modal2 = createModalRefMock('modal-2');
      const modal3 = createModalRefMock('modal-3');

      service.addToStack(modal1);
      service.addToStack(modal2);
      service.addToStack(modal3);

      service.removeFromStack(modal2);

      const allModals = service.getAllModals();
      expect(allModals.length).toBe(2);
      expect(allModals).toContain(modal1);
      expect(allModals).toContain(modal3);
      expect(allModals).not.toContain(modal2);
    });
  });

  describe('setZIndex', () => {
    it('should set correct z-index for level 0', () => {
      const overlayRef = {
        overlayElement: document.createElement('div'),
        backdropElement: document.createElement('div')
      } as unknown as OverlayRef;

      service.setZIndex(overlayRef, 0);

      expect(overlayRef.overlayElement.style.zIndex).toBe('1001');
      expect(overlayRef.backdropElement!.style.zIndex).toBe('1000');
    });

    it('should set correct z-index for level 1', () => {
      const overlayRef = {
        overlayElement: document.createElement('div'),
        backdropElement: document.createElement('div')
      } as unknown as OverlayRef;

      service.setZIndex(overlayRef, 1);

      expect(overlayRef.overlayElement.style.zIndex).toBe('1011');
      expect(overlayRef.backdropElement!.style.zIndex).toBe('1010');
    });

    it('should set correct z-index for level 2', () => {
      const overlayRef = {
        overlayElement: document.createElement('div'),
        backdropElement: document.createElement('div')
      } as unknown as OverlayRef;

      service.setZIndex(overlayRef, 2);

      expect(overlayRef.overlayElement.style.zIndex).toBe('1021');
      expect(overlayRef.backdropElement!.style.zIndex).toBe('1020');
    });

    it('should handle missing backdrop element', () => {
      const overlayRef = {
        overlayElement: document.createElement('div'),
        backdropElement: null
      } as unknown as OverlayRef;

      expect(() => service.setZIndex(overlayRef, 0)).not.toThrow();
      expect(overlayRef.overlayElement.style.zIndex).toBe('1001');
    });
  });

  describe('isTopmostModal', () => {
    it('should return true for topmost modal', () => {
        const modal1 = createModalRefMock('modal-1');
      const modal2 = createModalRefMock('modal-2');

      service.addToStack(modal1);
      service.addToStack(modal2);

      expect(service.isTopmostModal(modal2)).toBe(true);
    });

    it('should return false for non-topmost modal', () => {
      const modal1 = createModalRefMock('modal-1');
      const modal2 = createModalRefMock('modal-2');

      service.addToStack(modal1);
      service.addToStack(modal2);

      expect(service.isTopmostModal(modal1)).toBe(false);
    });

    it('should return false for empty stack', () => {
      const modalRef = createModalRefMock();

      expect(service.isTopmostModal(modalRef)).toBe(false);
    });

    it('should return true for single modal in stack', () => {
      const modalRef = createModalRefMock();
      service.addToStack(modalRef);

      expect(service.isTopmostModal(modalRef)).toBe(true);
    });

    it('should update topmost after removal', () => {
      const modal1 = createModalRefMock('modal-1');
      const modal2 = createModalRefMock('modal-2');

      service.addToStack(modal1);
      service.addToStack(modal2);

      expect(service.isTopmostModal(modal2)).toBe(true);
      expect(service.isTopmostModal(modal1)).toBe(false);

      service.removeFromStack(modal2);

      expect(service.isTopmostModal(modal1)).toBe(true);
    });
  });

  describe('getAllModals', () => {
    it('should return empty array when no modals', () => {
      const modals = service.getAllModals();

      expect(modals).toEqual([]);
    });

    it('should return all open modals', () => {
      const modal1 = createModalRefMock('modal-1');
      const modal2 = createModalRefMock('modal-2');
      const modal3 = createModalRefMock('modal-3');

      service.addToStack(modal1);
      service.addToStack(modal2);
      service.addToStack(modal3);

      const modals = service.getAllModals();

      expect(modals.length).toBe(3);
      expect(modals).toContain(modal1);
      expect(modals).toContain(modal2);
      expect(modals).toContain(modal3);
    });

    it('should return copy of stack (immutable)', () => {
      const modal1 = createModalRefMock('modal-1');
      service.addToStack(modal1);

      const modals = service.getAllModals() as ModalRef<any, any>[];
      modals.push(createModalRefMock('modal-2'));

      expect(service.getStackSize()).toBe(1);
    });
  });

  describe('closeAll', () => {  
    it('should close all modals in reverse order', () => {
      const modal1 = createModalRefMock('modal-1');
      const modal2 = createModalRefMock('modal-2');
      const modal3 = createModalRefMock('modal-3');

      service.addToStack(modal1);
      service.addToStack(modal2);
      service.addToStack(modal3);

      service.closeAll();

      expect(modal3.close).toHaveBeenCalled();
      expect(modal2.close).toHaveBeenCalled();
      expect(modal1.close).toHaveBeenCalled();
    });

    it('should handle empty stack', () => {
      expect(() => service.closeAll()).not.toThrow();
    });

    it('should close in correct order (topmost first)', () => {
      const closeOrder: string[] = [];
      const modal1 = createModalRefMock('modal-1');
      const modal2 = createModalRefMock('modal-2');
      const modal3 = createModalRefMock('modal-3');

      vi.mocked(modal1.close).mockImplementation(() => closeOrder.push('modal-1'));
      vi.mocked(modal2.close).mockImplementation(() => closeOrder.push('modal-2'));
      vi.mocked(modal3.close).mockImplementation(() => closeOrder.push('modal-3'));

      service.addToStack(modal1);
      service.addToStack(modal2);
      service.addToStack(modal3);

      service.closeAll();

      expect(closeOrder).toEqual(['modal-3', 'modal-2', 'modal-1']);
    });
  });

  describe('isEmpty', () => {
    it('should return true when stack is empty', () => {
      expect(service.isEmpty()).toBe(true);
    });

    it('should return false when stack has modals', () => {
      const modalRef = createModalRefMock();
      service.addToStack(modalRef);

      expect(service.isEmpty()).toBe(false);
    });

    it('should return true after removing all modals', () => {
      const modalRef = createModalRefMock();
      service.addToStack(modalRef);
      service.removeFromStack(modalRef);

      expect(service.isEmpty()).toBe(true);
    });
  });

  describe('getStackSize', () => {
    it('should return 0 for empty stack', () => {
      expect(service.getStackSize()).toBe(0);
    });

    it('should return correct size for multiple modals', () => {
      const modal1 = createModalRefMock('modal-1');
      const modal2 = createModalRefMock('modal-2');
      const modal3 = createModalRefMock('modal-3');

      service.addToStack(modal1);
      expect(service.getStackSize()).toBe(1);

      service.addToStack(modal2);
      expect(service.getStackSize()).toBe(2);

      service.addToStack(modal3);
      expect(service.getStackSize()).toBe(3);
    });

    it('should update after removal', () => {
      const modal1 = createModalRefMock('modal-1');
      const modal2 = createModalRefMock('modal-2');

      service.addToStack(modal1);
      service.addToStack(modal2);
      expect(service.getStackSize()).toBe(2);

      service.removeFromStack(modal1);
      expect(service.getStackSize()).toBe(1);
    });
  });

  describe('openModalsCount signal', () => {
    it('should be reactive to stack changes', () => {
        const modal1 = createModalRefMock('modal-1');
      const modal2 = createModalRefMock('modal-2');

      expect(service.openModalsCount()).toBe(0);

      service.addToStack(modal1);
      expect(service.openModalsCount()).toBe(1);

      service.addToStack(modal2);
      expect(service.openModalsCount()).toBe(2);

      service.removeFromStack(modal1);
      expect(service.openModalsCount()).toBe(1);

      service.removeFromStack(modal2);
      expect(service.openModalsCount()).toBe(0);
    });
  });
});   