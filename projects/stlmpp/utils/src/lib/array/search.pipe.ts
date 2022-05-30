import { Pipe, PipeTransform } from '@angular/core';
import { arraySearch } from 'st-utils';

@Pipe({ name: 'search' })
export class SearchPipe implements PipeTransform {
  transform<T, K extends keyof T>(
    array: T[] | null | undefined,
    keyOrKeysOrCallback: K | K[] | ((item: T) => T[K]),
    term: string | null | undefined
  ): T[] {
    return arraySearch(array ?? [], keyOrKeysOrCallback, term);
  }
}
