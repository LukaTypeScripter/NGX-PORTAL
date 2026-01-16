import { OverlayRef } from "@angular/cdk/overlay";
import { Observable, Subject } from "rxjs";


export interface DropDownRef<T = unknown, R = unknown> {
  close(result?: R): void;
  afterClosed(): Observable<R | undefined>;
}


export class DropDownRef<T = unknown, R = unknown> implements DropDownRef<T, R> {
    private readonly _afterClosed = new Subject<R | undefined>();
    private _isClosing = false;
    public readonly overlayRef: OverlayRef;
    public level: number = 0;
    public componentInstance?: T;

    constructor(overlayRef: OverlayRef) {
        this.overlayRef = overlayRef;
    }

    close(result?: R): void {
        if (this._isClosing) {
            return;
        }

        this._isClosing = true;

        this.overlayRef.dispose();
        this._afterClosed.next(result);
        this._afterClosed.complete();
    }

    afterClosed(): Observable<R | undefined> {
        return this._afterClosed.asObservable();
    }
}