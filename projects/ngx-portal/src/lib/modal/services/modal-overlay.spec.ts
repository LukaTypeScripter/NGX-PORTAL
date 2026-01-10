import { ModalOverlayService } from './modal-overlay.service';
import { TestBed } from '@angular/core/testing';

describe('ModalOverlayService', () => {
  let service: ModalOverlayService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModalOverlayService],
    });
    service = TestBed.inject(ModalOverlayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create overlay', () => {
    const overlay = service.createOverlay();
    expect(overlay).toBeDefined();
  });
});
