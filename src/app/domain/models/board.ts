import { Column } from './column';

export type BoardColors = 'sky' | 'yellow' | 'green' | 'red' | 'violet';

export interface Board {
  id: string;
  title: string;
  backgroundColor: BoardColors;
  columns?: Column[];
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  memberIds: string[];
}
