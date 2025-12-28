import { Injectable } from '@angular/core';
import { ColumnRepository } from '../../domain/repositories/columnRepository';
import { Observable } from 'rxjs';
import { ColumnModel } from '../../domain/models/columnModel';

@Injectable({ providedIn: 'root' })
export class CreateColumnAction {

  constructor(private columnRepository: ColumnRepository) {}

  execute(boardId: string, title: string, position: string): Observable<ColumnModel> {

    return this.columnRepository.createColumn(boardId, title, position);
  }
}
