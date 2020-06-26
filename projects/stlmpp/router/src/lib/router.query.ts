import { Injectable } from '@angular/core';
import { ActivatedRoute, Data, ParamMap, Params } from '@angular/router';
import { isArray, isNullOrUndefined, isString } from 'is-what';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { isEqual } from 'lodash';

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

  private selectBase(
    path: 'paramMap' | 'queryParamMap',
    params?: string | string[]
  ): Observable<Params | string>;
  private selectBase(path: 'data', params?: string | string[]): Observable<Data | any>;
  private selectBase(path: 'fragment'): Observable<string>;
  private selectBase(path: string, params?: string | string[]): Observable<any> {
    let params$: Observable<any>;
    if (isArray(params)) {
      params$ = this.activatedRoute[path].pipe(
        map(routeParams =>
          params.reduce((acc, item) => {
            const routeParam = (routeParams as ParamMap).get?.(item) ?? routeParams[item];
            if (routeParam) {
              acc[item] = routeParam;
            }
            return acc;
          }, {})
        )
      );
    } else if (!isNullOrUndefined(params)) {
      params$ = this.activatedRoute[path].pipe(
        map(routeParams => (routeParams as ParamMap).get?.(params) ?? routeParams?.[params])
      );
    } else {
      params$ = this.activatedRoute[path].pipe(
        map((paramsRoute: ParamMap | Data | string) => {
          if (isString(paramsRoute) || !('get' in paramsRoute)) {
            return paramsRoute;
          } else {
            return (paramsRoute as ParamMap).keys.reduce(
              (acc, key) => (paramsRoute.has(key) ? { ...acc, [key]: paramsRoute.get(key) } : acc),
              {}
            );
          }
        })
      );
    }
    return params$.pipe(
      filter(p => !isNullOrUndefined(p)),
      distinctUntilChanged(isEqual)
    );
  }

  private getBase(path: 'paramMap' | 'queryParamMap', params?: string | string[]): Params | string;
  private getBase(path: 'data', params?: string | string[]): Data | any;
  private getBase(path: 'fragment'): string;
  private getBase(path: string, params?: string | string[]): any {
    const route = this.activatedRoute;
    const paramsRoute = route.snapshot[path];
    if (isArray(params)) {
      return params.reduce((acc, param) => {
        const routeParam = paramsRoute.get?.(param) ?? paramsRoute?.[param];
        if (routeParam) {
          acc[param] = routeParam;
        }
        return acc;
      }, {});
    } else if (!isNullOrUndefined(params)) {
      return paramsRoute.get?.(params) ?? paramsRoute?.[params];
    } else {
      if ('get' in paramsRoute) {
        return (paramsRoute as ParamMap).keys.reduce(
          (acc, key) => (paramsRoute.has(key) ? { ...acc, [key]: paramsRoute.get(key) } : acc),
          {}
        );
      } else {
        return paramsRoute;
      }
    }
  }

  getParams(): Params;
  getParams(param: string): string;
  getParams(params: string[]): Params;
  getParams(params?: string | string[]): string | Params {
    return this.getBase('paramMap', params);
  }

  selectParams(): Observable<Params>;
  selectParams<R = any>(param: string): Observable<R>;
  selectParams(params: string[]): Observable<Params>;
  selectParams(params?: string[] | string): Observable<any> {
    return this.selectBase('paramMap', params);
  }

  getQueryParams(): Params;
  getQueryParams(param: string): string;
  getQueryParams(params: string[]): Params;
  getQueryParams(params?: string | string[]): string | Params {
    return this.getBase('queryParamMap', params);
  }

  selectQueryParams(): Observable<Params>;
  selectQueryParams(param: string): Observable<string>;
  selectQueryParams(params: string[]): Observable<Params>;
  selectQueryParams(params?: string[] | string): Observable<any> {
    return this.selectBase('queryParamMap', params);
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
