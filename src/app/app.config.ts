import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { BoardRepository } from './domain/repositories/board.repository';
import { BoardLocalStorageAdapter } from './infra/adapters/boardLocalStorage.adapter';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ColumnRepository } from './domain/repositories/column.repository';
import { ColumnLocalStorageAdapter } from './infra/adapters/columnLocalStorage.adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    { provide: BoardRepository, useClass: BoardLocalStorageAdapter },
    { provide: ColumnRepository, useClass: ColumnLocalStorageAdapter },
  ],
};
