import { Card } from './card';

export interface Column {
  id: string;
  title: string;
  position: string;
  boardId: string;
  cards?: Card[];
  createdAt: Date;
  updatedAt: Date;
}
