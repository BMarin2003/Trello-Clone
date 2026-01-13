import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      [@fadeInOut]
    >
      <div
        class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all"
        [@scaleIn]
      >
        <div
          class="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3"
        >
          <div class="p-2 bg-red-100 rounded-full text-red-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900">{{ title }}</h3>
        </div>

        <div class="p-6">
          <p class="text-gray-600 leading-relaxed">{{ message }}</p>
        </div>

        <div class="p-6 pt-0 flex justify-end gap-3">
          <button
            (click)="close()"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            (click)="confirm()"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-lg shadow-red-500/30 transition-all cursor-pointer"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
    }
  `,
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('150ms ease-in', style({ opacity: 0 }))]),
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ transform: 'scale(0.95)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ]),
  ],
})
export class ConfirmModalComponent {
  isOpen = signal(false);
  @Input() title: string = 'Confirmar acción';
  @Input() message: string = '¿Estás seguro?';
  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
    this.onCancel.emit();
  }

  confirm() {
    this.onConfirm.emit();
  }
}
