import { TestBed } from "@angular/core/testing";
import { DragAndDropModalService } from "./drag-and-drop-modal.service";    
import { createModalRefMock } from "../test-helper";

describe('DragAndDropModalService', () => {
    let service: DragAndDropModalService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [DragAndDropModalService]
        });
        service = TestBed.inject(DragAndDropModalService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create drag and drop modal', () => {
        const modalRef = createModalRefMock();
        service.createDragAndDropModal(modalRef);
        expect(modalRef.overlayRef.overlayElement.classList.contains('drag-and-drop-modal')).toBe(true);
    });

    it('should start dragging', async () => {
        const modalRef = createModalRefMock();
        service.createDragAndDropModal(modalRef);
        const overlayElement = modalRef.overlayRef.overlayElement;
        
        overlayElement.style.position = 'static';
        overlayElement.style.left = '0px';
        overlayElement.style.top = '0px';
        
        const mousedownEvent = new MouseEvent('mousedown', { 
            clientX: 100, 
            clientY: 100,
            bubbles: true,
            cancelable: true
        });
        overlayElement.dispatchEvent(mousedownEvent);
        
        const mousemoveEvent = new MouseEvent('mousemove', { 
            clientX: 200, 
            clientY: 200,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(mousemoveEvent);
        
        await new Promise((resolve) => setTimeout(resolve, 10));
        
        expect(overlayElement.style.position).toBe('absolute');
        expect(overlayElement.style.left).toBe('100px');
        expect(overlayElement.style.top).toBe('100px');
    });

    it('should stop dragging', async () => {
        const modalRef = createModalRefMock();
        service.createDragAndDropModal(modalRef);
        const overlayElement = modalRef.overlayRef.overlayElement;

        overlayElement.style.position = 'static';
        overlayElement.style.left = '0px';
        overlayElement.style.top = '0px';

        const mouseupEvent = new MouseEvent('mouseup', { 
            clientX: 200, 
            clientY: 200,
        });

        overlayElement.dispatchEvent(mouseupEvent);

        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(overlayElement.style.position).toBe('static');
        expect(overlayElement.style.left).toBe('0px');
        expect(overlayElement.style.top).toBe('0px');
    });

    it('should destroy drag and drop modal', () => {
        const modalRef = createModalRefMock();
        service.createDragAndDropModal(modalRef);
        service.destroyDragAndDropModal(modalRef);
        expect(modalRef.overlayRef.overlayElement.classList.contains('drag-and-drop-modal')).toBe(false);
    });
});