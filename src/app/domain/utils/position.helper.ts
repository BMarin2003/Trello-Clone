import { LexoRank } from 'lexorank';

export class PositionHelper {
  static getNewPosition(lastPosition?: string): string {
    if (!lastPosition) {
      return LexoRank.middle().toString();
    }
    try {
      return LexoRank.parse(lastPosition).genNext().toString();
    } catch (e) {
      return LexoRank.middle().toString();
    }
  }

  static rankBetween(prev?: string, next?: string): string {
    if (!prev && !next) {
      return LexoRank.middle().toString();
    }

    let prevRank: LexoRank | null = null;
    let nextRank: LexoRank | null = null;

    if (prev) {
      try {
        prevRank = LexoRank.parse(prev);
      } catch (e) {}
    }
    if (next) {
      try {
        nextRank = LexoRank.parse(next);
      } catch (e) {}
    }

    if (!prevRank && !nextRank) {
      return LexoRank.middle().toString();
    }
    if (!prevRank && nextRank) {
      return nextRank.genPrev().toString();
    }
    if (prevRank && !nextRank) {
      return prevRank.genNext().toString();
    }

    return prevRank!.between(nextRank!).toString();
  }
}
