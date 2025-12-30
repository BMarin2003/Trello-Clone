import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ColumnRepository } from '../../domain/repositories/column.repository';
import { ColumnModel } from '../../domain/models/column.model';
import { PositionHelper } from '../../domain/utils/position.helper';

@Injectable({ providedIn: 'root' })
export class CreateColumnAction {
  private columnRepository = inject(ColumnRepository);

  execute(
    boardId: string,
    title: string,
    lastPosition?: string
  ): Observable<ColumnModel> {
    const newPosition = PositionHelper.getNewPosition(lastPosition);

    return this.columnRepository.createColumn(boardId, title, newPosition);
  }
}
