import { Observable } from 'rxjs';
import { CardModel } from '../models/cardModel';

export abstract class CardRepository {
  abstract getCardDetail(id: string): Observable<CardModel | null>;

  abstract createCard(card: Omit<CardModel, 'id' | 'createdAt' | 'updatedAt'>): Observable<CardModel>;

  abstract updateCard(id: string, changes: Partial<CardModel>): Observable<CardModel>;

  abstract updateCardPosition(id: string, newPosition: string, newColumnId?: string): Observable<CardModel>;

  abstract deleteCard(id: string): Observable<boolean>;
}
