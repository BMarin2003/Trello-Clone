import { Injectable } from '@angular/core';
import { ColumnRepository } from '../../domain/repositories/column.repository';
import { Observable } from 'rxjs';
import { ColumnModel } from '../../domain/models/column.model';

@Injectable({ providedIn: 'root' })
export class CreateColumnAction {

  constructor(private columnRepository: ColumnRepository) {}

  execute(boardId: string, title: string, position: string): Observable<ColumnModel> {

    return this.columnRepository.createColumn(boardId, title, position);
  }
}
