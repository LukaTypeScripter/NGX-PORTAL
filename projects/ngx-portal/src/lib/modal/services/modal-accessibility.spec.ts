import { TestBed } from "@angular/core/testing";
import { ModalAccessibilityService } from "./modal-accessibility.service";
import { OverlayRef } from "@angular/cdk/overlay";


describe('ModalAccessibilityService', () => {
    let service: ModalAccessibilityService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ModalAccessibilityService]
        });
        service = TestBed.inject(ModalAccessibilityService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set ARIA attributes', () => {
        const overlayElement = document.createElement('div');
        service.setAriaAttributes(overlayElement, { ariaLabel: 'Test Label' });
        expect(overlayElement.getAttribute('aria-label')).toBe('Test Label');
    });

    it('should create focus trap', () => {
        const overlayRef = {
            overlayElement: document.createElement('div'),
            backdropElement: document.createElement('div'),
        } as unknown as OverlayRef;
        const focusTrap = service.createFocusTrap(overlayRef);
        expect(focusTrap).toBeTruthy();
    });

    it('should restore focus', () => {
        const element = document.createElement('div');
        const focusSpy = vi.spyOn(element, 'focus');
        service.restoreFocus(element);
        expect(focusSpy).toHaveBeenCalled();
    });

    it('should disable body scroll', () => {
        service.disableBodyScroll();
        expect(document.body.style.overflow).toBe('hidden');
    });

    it('should enable body scroll', () => {
        service.enableBodyScroll();
        expect(document.body.style.overflow).toBe('auto');
    });
});