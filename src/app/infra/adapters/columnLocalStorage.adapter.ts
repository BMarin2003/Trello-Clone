import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ColumnRepository } from '../../domain/repositories/column.repository';
import { ColumnModel } from '../../domain/models/column.model';

@Injectable({ providedIn: 'root' })
export class ColumnLocalStorageAdapter extends ColumnRepository {

  private readonly STORAGE_KEY = 'trello-columns';
  private readonly LATENCY_MS = 10;

  createColumn(boardId: string, title: string, position: string): Observable<ColumnModel> {
    const newColumn: ColumnModel = {
      id: crypto.randomUUID(),
      title,
      position,
      boardId,
      createdAt: new Date(),
      updatedAt: new Date(),
      cards: []
    };

    const columns = this.getFromStorage();
    columns.push(newColumn);
    this.saveToStorage(columns);

    return of(newColumn).pipe(delay(this.LATENCY_MS));
  }

  updateColumn(id: string, changes: Partial<ColumnModel>): Observable<ColumnModel> {
    const columns = this.getFromStorage();
    const index = columns.findIndex(c => c.id === id);

    if (index === -1) return throwError(() => new Error('Column not found'));

    const updatedColumn = { ...columns[index], ...changes, updatedAt: new Date() };
    columns[index] = updatedColumn;
    this.saveToStorage(columns);

    return of(updatedColumn).pipe(delay(this.LATENCY_MS));
  }

  deleteColumn(id: string): Observable<boolean> {

    let columns = this.getFromStorage();
    const initialLength = columns.length;
    columns = columns.filter(c => c.id !== id);
    this.saveToStorage(columns);

    if (columns.length === initialLength) {
      return of(false).pipe(delay(this.LATENCY_MS));
    }

    const cardsString = localStorage.getItem('trello-cards');
    let cards = JSON.parse(cardsString || '[]');

    cards = cards.filter((c: any) => c.columnId !== id);

    localStorage.setItem('trello-cards', JSON.stringify(cards));

    return of(true).pipe(delay(this.LATENCY_MS));
  }

  private getFromStorage(): ColumnModel[] {
    const str = localStorage.getItem(this.STORAGE_KEY);
    const columns = JSON.parse(str || '[]');

    return columns.map((c: any) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt)
    }));
  }

  private saveToStorage(columns: ColumnModel[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(columns));
  }
}
