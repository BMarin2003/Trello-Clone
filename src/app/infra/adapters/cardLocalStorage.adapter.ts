import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CardRepository } from '../../domain/repositories/card.repository';
import { CardModel } from '../../domain/models/card.model';

@Injectable({ providedIn: 'root' })
export class CardLocalStorageAdapter extends CardRepository {
  private readonly STORAGE_KEY = 'trello-cards';
  private readonly LATENCY_MS = 10;

  constructor() {
    super();
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    }
  }

  createCard(
    card: Omit<CardModel, 'id' | 'createdAt' | 'updatedAt'>
  ): Observable<CardModel> {
    const newCard: CardModel = {
      ...card,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      assigneeIds: card.assigneeIds || [],
      tags: card.tags || [],
    } as CardModel;

    const cards = this.getFromStorage();
    cards.push(newCard);
    this.saveToStorage(cards);

    return of(newCard).pipe(delay(this.LATENCY_MS));
  }

  getCardDetail(id: string): Observable<CardModel | null> {
    const cards = this.getFromStorage();
    const card = cards.find((c) => c.id === id);

    return of(card || null).pipe(delay(this.LATENCY_MS));
  }

  updateCard(id: string, changes: Partial<CardModel>): Observable<CardModel> {
    const cards = this.getFromStorage();
    const index = cards.findIndex((c) => c.id === id);

    if (index === -1) {
      return throwError(() => new Error('Card not found'));
    }

    const updatedCard = {
      ...cards[index],
      ...changes,
      updatedAt: new Date(),
    };

    cards[index] = updatedCard;
    this.saveToStorage(cards);

    return of(updatedCard).pipe(delay(this.LATENCY_MS));
  }

  updateCardPosition(
    id: string,
    newPosition: string,
    newColumnId?: string
  ): Observable<CardModel> {
    const cards = this.getFromStorage();
    const index = cards.findIndex((c) => c.id === id);

    if (index === -1) {
      return throwError(() => new Error('Card not found'));
    }

    const card = cards[index];

    card.position = [newPosition];

    if (newColumnId) {
      card.columnId = newColumnId;
    }

    card.updatedAt = new Date();

    cards[index] = card;
    this.saveToStorage(cards);

    return of(card).pipe(delay(this.LATENCY_MS));
  }

  deleteCard(id: string): Observable<boolean> {
    let cards = this.getFromStorage();
    const initialLength = cards.length;
    cards = cards.filter((c) => c.id !== id);

    this.saveToStorage(cards);

    return of(cards.length < initialLength).pipe(delay(this.LATENCY_MS));
  }

  private getFromStorage(): CardModel[] {
    const str = localStorage.getItem(this.STORAGE_KEY);
    const cards = JSON.parse(str || '[]');
    return cards.map((c: any) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
      deadline: c.deadline ? new Date(c.deadline) : undefined,
    }));
  }

  private saveToStorage(cards: CardModel[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cards));
  }
}
