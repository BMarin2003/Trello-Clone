import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserGroupModel, UserModel } from '../../domain/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class MockUserService {
  private users: UserModel[] = [
    {
      id: 'u1',
      name: 'Bryan Marin',
      email: 'bryan@example.com',
      avatar:
        'https://ui-avatars.com/api/?name=Bryan+Marin&background=0D8ABC&color=fff',
    },
    {
      id: 'u2',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
    },
    {
      id: 'u3',
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=random',
    },
    {
      id: 'u4',
      name: 'Alice Cooper',
      email: 'alice@example.com',
      avatar: 'https://ui-avatars.com/api/?name=Alice+Cooper&background=random',
    },
  ];

  private groups: UserGroupModel[] = [
    {
      id: 'g1',
      name: 'Frontend Team',
      memberIds: ['u1', 'u2'],
      color: 'bg-blue-500',
    },
    {
      id: 'g2',
      name: 'Backend Team',
      memberIds: ['u3', 'u4'],
      color: 'bg-green-500',
    },
    {
      id: 'g3',
      name: 'Designers',
      memberIds: ['u2', 'u3'],
      color: 'bg-purple-500',
    },
  ];

  getUsers(): Observable<UserModel[]> {
    return of(this.users);
  }

  getGroups(): Observable<UserGroupModel[]> {
    return of(this.groups);
  }

  getUserById(id: string): UserModel | undefined {
    return this.users.find((u) => u.id === id);
  }

  getGroupById(id: string): UserGroupModel | undefined {
    return this.groups.find((g) => g.id === id);
  }
}
