import { Observable } from 'rxjs';
import { CardModel } from '../models/cardModel';

export abstract class CardRepository {
  abstract create(card: Omit<CardModel, 'id' | 'createdAt' | 'updatedAt'>): Observable<CardModel>;

  abstract update(id: string, changes: Partial<CardModel>): Observable<CardModel>;

  abstract updatePosition(id: string, newPosition: string, newColumnId?: string): Observable<CardModel>;

  abstract delete(id: string): Observable<boolean>;
}
