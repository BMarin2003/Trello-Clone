import { CardModel } from './cardModel';

export interface ColumnModel {
  id: string;
  title: string;
  position: string;
  boardId: string;
  cards?: CardModel[];
  createdAt: Date;
  updatedAt: Date;
}
