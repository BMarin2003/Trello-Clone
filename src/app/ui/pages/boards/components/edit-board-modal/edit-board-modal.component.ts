import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { BoardModel, Colors } from '../../../../../domain/models/board.model';
import { MockUserService } from '../../../../../infra/services/mock-user.service';
import {
  UserGroupModel,
  UserModel,
} from '../../../../../domain/models/user.model';

@Component({
  selector: 'app-edit-board-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-board-modal.component.html',
})
export class EditBoardModalComponent implements OnInit {
  @Input() board!: BoardModel;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<Partial<BoardModel>>();

  private mockUserService = inject(MockUserService);

  users: UserModel[] = [];
  groups: UserGroupModel[] = [];

  form!: FormGroup;

  colors: Colors[] = ['sky', 'yellow', 'green', 'red', 'violet', 'gray'];

  colorMap: Record<Colors, string> = {
    sky: 'bg-sky-500',
    yellow: 'bg-amber-500',
    green: 'bg-emerald-500',
    red: 'bg-rose-500',
    violet: 'bg-violet-500',
    gray: 'bg-slate-500',
    white: 'bg-white',
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.mockUserService.getUsers().subscribe((u) => (this.users = u));
    this.mockUserService.getGroups().subscribe((g) => (this.groups = g));

    this.form = this.fb.group({
      title: [this.board.title, [Validators.required, Validators.minLength(3)]],
      backgroundColor: [this.board.backgroundColor, [Validators.required]],
      projectName: [this.board.projectName || ''],
      responsibles: [this.board.responsibles || []],
      memberIds: [this.board.memberIds || []],
      memberGroupIds: [this.board.memberGroupIds || []],
    });
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('overlay')) {
      this.close.emit();
    }
  }

  toggleSelection(controlName: string, id: string) {
    const current = this.form.get(controlName)?.value as string[];
    if (current.includes(id)) {
      this.form.get(controlName)?.setValue(current.filter((x) => x !== id));
    } else {
      this.form.get(controlName)?.setValue([...current, id]);
    }
  }

  isSelected(controlName: string, id: string): boolean {
    const current = this.form.get(controlName)?.value as string[];
    return current ? current.includes(id) : false;
  }

  submit() {
    if (this.form.valid) {
      this.confirm.emit(this.form.value);
    }
  }
}
