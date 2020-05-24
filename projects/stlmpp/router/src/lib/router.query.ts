import { Injectable } from '@angular/core';
import { ActivatedRoute, Data, Params } from '@angular/router';
import { isArray, isNullOrUndefined } from 'is-what';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, pluck } from 'rxjs/operators';
import { isEqual } from 'underscore';

@Injectable()
export class RouterQuery {
  constructor(private _activatedRoute: ActivatedRoute) {}

  get activatedRoute(): ActivatedRoute {
    let state = this._activatedRoute.root;
    while (state.firstChild) {
      state = state.firstChild;
    }
    return state;
  }

  private selectBase<R = any>(
    path: string,
    params?: string | string[]
  ): Observable<R> {
    let params$: Observable<R>;
    if (isArray(params)) {
      params$ = this.activatedRoute[path].pipe(
        map(routeParams =>
          params.reduce((acc, item) => {
            const routeParam = routeParams[item];
            if (routeParam) {
              acc[item] = routeParam;
            }
            return acc;
          }, {})
        )
      );
    } else if (!isNullOrUndefined(params)) {
      params$ = this.activatedRoute[path].pipe(pluck(params));
    } else {
      params$ = this.activatedRoute[path];
    }
    return params$.pipe(
      filter(p => !isNullOrUndefined(p)),
      distinctUntilChanged(isEqual)
    );
  }

  private getBase(path: string, params?: string | string[]): string | Params {
    const route = this.activatedRoute;
    if (isArray(params)) {
      return params.reduce((acc, param) => {
        const routeParam = route.snapshot[path][param];
        if (routeParam) {
          acc[param] = routeParam;
        }
        return acc;
      }, {});
    } else {
      return route.snapshot[path][params];
    }
  }

  getParams(): Params;
  getParams(param: string): string;
  getParams(params: string[]): Params;
  getParams(params?: string | string[]): string | Params {
    return this.getBase('params', params);
  }

  selectParams(): Observable<Params>;
  selectParams<R = any>(param: string): Observable<R>;
  selectParams(params: string[]): Observable<Params>;
  selectParams(params?: string[] | string): Observable<any> {
    return this.selectBase('params', params);
  }

  getQueryParams(): Params;
  getQueryParams(param: string): string;
  getQueryParams(params: string[]): Params;
  getQueryParams(params?: string | string[]): string | Params {
    return this.getBase('queryParams', params);
  }

  selectQueryParams(): Observable<Params>;
  selectQueryParams<R = any>(param: string): Observable<R>;
  selectQueryParams(params: string[]): Observable<Params>;
  selectQueryParams(params?: string[] | string): Observable<any> {
    return this.selectBase('queryParams', params);
  }

  getData(): Data;
  getData(param: string): string;
  getData(params: string[]): Data;
  getData(params?: string | string[]): string | Data {
    return this.getBase('data', params);
  }

  selectData(): Observable<Data>;
  selectData<R = any>(param: string): Observable<R>;
  selectData(params: string[]): Observable<Data>;
  selectData(params?: string[] | string): Observable<any> {
    return this.selectBase('data', params);
  }

  getFragment(): string {
    return this.getBase('fragment') as string;
  }

  selectFragment(): Observable<string> {
    return this.selectBase('fragment');
  }
}
