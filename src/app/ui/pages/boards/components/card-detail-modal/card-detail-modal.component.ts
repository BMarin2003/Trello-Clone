import {
  Component,
  EventEmitter,
  Input,
  Output,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModel } from '../../../../../domain/models/card.model';
import { MockUserService } from '../../../../../infra/services/mock-user.service';
import { UserModel } from '../../../../../domain/models/user.model';

@Component({
  selector: 'app-card-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './card-detail-modal.component.html',
})
export class CardDetailModalComponent implements OnInit {
  @Input() card: CardModel | null = null;
  @Input() columnTitle: string = '';
  @Input() isOpen = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onUpdate = new EventEmitter<Partial<CardModel>>();

  private mockUserService = inject(MockUserService);
  users: UserModel[] = [];
  showUserDropdown = false;

  constructor() {}

  ngOnInit() {
    this.mockUserService.getUsers().subscribe((u) => (this.users = u));
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen) {
      this.close();
    }
  }

  close() {
    this.onClose.emit();
  }

  updateField(field: keyof CardModel, value: any) {
    if (!this.card) return;
    this.onUpdate.emit({ [field]: value });
  }

  updateDate(field: keyof CardModel, valueStr: string) {
    if (!this.card) return;
    const date = valueStr ? new Date(valueStr) : undefined;
    this.onUpdate.emit({ [field]: date });
  }

  formatDateForInput(date?: Date): string {
    if (!date) return '';
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }

  isOverdue(date?: Date): boolean {
    if (!date) return false;
    return new Date(date) < new Date();
  }

  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
  }

  toggleMember(userId: string) {
    if (!this.card) return;
    this.showUserDropdown = false;
    const current = this.card.assigneeIds || [];
    const newAssignees = current.includes(userId)
      ? current.filter((id) => id !== userId)
      : [...current, userId];

    this.updateField('assigneeIds', newAssignees);
  }

  getUserName(id: string): string {
    return this.users.find((u) => u.id === id)?.name || 'Usuario';
  }

  getUserAvatar(id: string): string {
    return this.users.find((u) => u.id === id)?.avatar || '';
  }
}
