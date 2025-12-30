export class PositionHelper {
  static getNewPosition(lastPosition?: string): string {
    if (!lastPosition) {
      return 'a';
    }
    const lastChar = lastPosition.slice(-1);
    if (lastChar === 'z') {
      return lastPosition + '0';
    }
    const nextChar = String.fromCharCode(lastChar.charCodeAt(0) + 1);
    return lastPosition.slice(0, -1) + nextChar;
  }
}
