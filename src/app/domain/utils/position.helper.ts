import { LexoRank } from 'lexorank';

export class PositionHelper {
  static getNewPosition(lastPosition?: string): string {
    if (!lastPosition) {
      return LexoRank.middle().toString();
    }
    return LexoRank.parse(lastPosition).genNext().toString();
  }

  static rankBetween(prev?: string, next?: string): string {
    if (!prev && !next) {
      return LexoRank.middle().toString();
    }
    if (!prev) {
      return LexoRank.parse(next!).genPrev().toString();
    }
    if (!next) {
      return LexoRank.parse(prev).genNext().toString();
    }
    return LexoRank.parse(prev).between(LexoRank.parse(next)).toString();
  }
}
