import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { BoardRepository } from '../../domain/repositories/board.repository';
import { BoardModel, Colors } from '../../domain/models/board.model';

@Injectable({ providedIn: 'root' })
export class BoardLocalStorageAdapter extends BoardRepository {
  private readonly STORAGE_KEY = 'trello-boards';
  private readonly LATENCY_MS = 10;

  constructor() {
    super();
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    }
  }

  createBoard(
    title: string,
    backgroundColor: string,
    config?: {
      projectId?: string;
      projectName?: string;
      responsibles?: string[];
      memberIds?: string[];
      memberGroupIds?: string[];
    }
  ): Observable<BoardModel> {
    const newBoard: BoardModel = {
      id: crypto.randomUUID(),
      title,
      backgroundColor: backgroundColor as Colors,
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: 'me',
      memberIds: config?.memberIds || ['me'],
      columns: [],
      projectId: config?.projectId,
      projectName: config?.projectName,
      responsibles: config?.responsibles,
      memberGroupIds: config?.memberGroupIds,
    };

    const boards = this.getFromStorage();
    boards.push(newBoard);
    this.saveToStorage(boards);

    return of(newBoard).pipe(delay(this.LATENCY_MS));
  }

  getBoardDetail(id: string): Observable<BoardModel | null> {
    const boards = this.getFromStorage();
    const board = boards.find((b) => b.id === id) || null;
    return of(board).pipe(delay(this.LATENCY_MS));
  }

  getAll(): Observable<BoardModel[]> {
    const boards = this.getFromStorage();
    return of(boards).pipe(delay(this.LATENCY_MS));
  }

  updateBoard(
    id: string,
    changes: Partial<BoardModel>
  ): Observable<BoardModel> {
    const boards = this.getFromStorage();
    const index = boards.findIndex((b) => b.id === id);

    if (index === -1) {
      return throwError(() => new Error('Board not found'));
    }

    const updatedBoard = {
      ...boards[index],
      ...changes,
      updatedAt: new Date(),
    };

    boards[index] = updatedBoard;
    this.saveToStorage(boards);

    return of(updatedBoard).pipe(delay(this.LATENCY_MS));
  }

  deleteBoard(id: string): Observable<boolean> {
    let boards = this.getFromStorage();
    const initialLength = boards.length;
    boards = boards.filter((b) => b.id !== id);

    this.saveToStorage(boards);
    if (boards.length === initialLength) {
      return of(false).pipe(delay(this.LATENCY_MS));
    }

    const columnsString = localStorage.getItem('trello-columns');
    let columns = JSON.parse(columnsString || '[]');

    const columnsToDelete = columns.filter((c: any) => c.boardId === id);
    const columnIdsToDelete = columnsToDelete.map((c: any) => c.id);

    columns = columns.filter((c: any) => c.boardId !== id);
    localStorage.setItem('trello-columns', JSON.stringify(columns));

    const cardsString = localStorage.getItem('trello-cards');
    let cards = JSON.parse(cardsString || '[]');

    cards = cards.filter((c: any) => !columnIdsToDelete.includes(c.columnId));
    localStorage.setItem('trello-cards', JSON.stringify(cards));

    return of(true).pipe(delay(this.LATENCY_MS));
  }

  private getFromStorage(): BoardModel[] {
    const str = localStorage.getItem(this.STORAGE_KEY);
    const boards = JSON.parse(str || '[]');
    return boards.map((b: any) => ({
      ...b,
      createdAt: new Date(b.createdAt),
      updatedAt: new Date(b.updatedAt),
    }));
  }

  private saveToStorage(boards: BoardModel[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(boards));
  }
}
