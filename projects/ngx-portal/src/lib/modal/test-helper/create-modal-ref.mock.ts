import { Subject } from "rxjs";
import { CloseResult } from "../modal-config";
import { ModalRef } from "../modal-ref";
import { OverlayRef } from "@angular/cdk/overlay";
import { vi } from "vitest";
import { ModalAnimationService } from "../services/modal-animation.service";

    export function createModalRefMock<T = unknown, R = unknown>(id: string = 'modal-1'): ModalRef<T, R> {
        return {
            level: 0,
            id,
            componentInstance: null,
            animationEnabled: true,
            animationDuration: 300,
            openingTimeoutId: undefined,
            afterClosed: () => new Subject<CloseResult<any>>().asObservable(),
            _isClosing: false,
            _afterClosed: new Subject<CloseResult<any>>(),
            overlayRef: {
                overlayElement: document.createElement('div'),
                backdropElement: document.createElement('div'),
            } as unknown as OverlayRef,
            _animationService: {} as ModalAnimationService,
            close: vi.fn(),
        } as unknown as ModalRef<T, R>;

    }       