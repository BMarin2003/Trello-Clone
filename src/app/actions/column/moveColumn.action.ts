import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ColumnRepository } from '../../domain/repositories/column.repository';
import { ColumnModel } from '../../domain/models/column.model';

@Injectable({ providedIn: 'root' })
export class MoveColumnAction {
  private columnRepository = inject(ColumnRepository);

  execute(id: string, newPosition: string): Observable<ColumnModel> {
    return this.columnRepository.updateColumn(id, { position: newPosition });
  }
}
