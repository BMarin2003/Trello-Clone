export enum CardPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface CardModel {
  id: string;
  title: string;
  description?: string;
  priority: CardPriority;
  createdAt: Date;
  updatedAt: Date;
  deadline?: Date;
  creatorId: string;
  assigneeIds: string[];
  supervisorId?: string;
  columnId: string;
  area?: string;
  tags?: string[];
}

export const canEditCard = (card: CardModel, userId: string): boolean => {
  if (card.creatorId === userId) return true;
  if (card.assigneeIds.includes(userId)) return true;
  if (card.supervisorId === userId) return true;
  return false;
};
