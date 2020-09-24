import { Injectable } from '@angular/core';
import { ActivatedRoute, Data, ParamMap, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, pluck } from 'rxjs/operators';
import { isArray, isEqual, isNil, isString } from 'lodash-es';

type ParamType = 'queryParamMap' | 'paramMap';

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

  private reduceParams(params: string[], paramMap: ParamMap): Params {
    return params.reduce((acc, param) => (paramMap.has(param) ? { ...acc, [param]: paramMap.get(param) } : acc), {});
  }

  private getParamsBase(type: ParamType, params?: string | string[]): string | Params {
    const paramMap = this.activatedRoute.snapshot[type];
    if (!params) {
      return this.reduceParams(paramMap.keys, paramMap);
    } else if (isString(params)) {
      return paramMap.get(params);
    } else if (isArray(params)) {
      return this.reduceParams(params, paramMap);
    }
  }

  private selectParamsBase(type: ParamType, params?: string | string[]): Observable<string> | Observable<Params> {
    const paramMap = this.activatedRoute[type];
    if (!params) {
      return paramMap.pipe(
        map(paramsRoute => this.reduceParams(paramsRoute.keys, paramsRoute)),
        distinctUntilChanged(isEqual)
      );
    } else if (isString(params)) {
      return paramMap.pipe(
        map(paramRoute => paramRoute.get(params)),
        distinctUntilChanged<string>()
      );
    } else if (isArray(params)) {
      return paramMap.pipe(
        map(paramsRoute => this.reduceParams(params, paramsRoute)),
        distinctUntilChanged(isEqual)
      );
    }
  }

  getParams(): Params;
  getParams(param: string): string;
  getParams(params: string[]): Params;
  getParams(params?: string | string[]): string | Params {
    return this.getParamsBase('paramMap', params);
  }

  getAllParams(param: string): string[] {
    let state = this._activatedRoute;
    const params = new Set<string>();
    while (state.firstChild) {
      if (state.snapshot.paramMap.has(param)) {
        params.add(state.snapshot.paramMap.get(param));
      }
      state = state.firstChild;
    }
    if (state.snapshot.paramMap.has(param)) {
      params.add(state.snapshot.paramMap.get(param));
    }
    return [...params];
  }

  selectParams(): Observable<Params>;
  selectParams<R = any>(param: string): Observable<R>;
  selectParams(params: string[]): Observable<Params>;
  selectParams(params?: string[] | string): Observable<any> {
    return this.selectParamsBase('paramMap', params);
  }

  getQueryParams(): Params;
  getQueryParams(param: string): string;
  getQueryParams(params: string[]): Params;
  getQueryParams(params?: string | string[]): string | Params {
    return this.getParamsBase('queryParamMap', params);
  }

  selectQueryParams(): Observable<Params>;
  selectQueryParams(param: string): Observable<string>;
  selectQueryParams(params: string[]): Observable<Params>;
  selectQueryParams(params?: string[] | string): Observable<any> {
    return this.selectParamsBase('queryParamMap', params);
  }

  getData(): Data;
  getData(param: string): string;
  getData(params: string[]): Data;
  getData(params?: string | string[]): string | Data {
    const data = this.activatedRoute.snapshot.data;
    if (!params) {
      return data;
    } else if (isString(params)) {
      return data[params];
    } else if (isArray(params)) {
      return params.reduce((acc, param) => (!isNil(data?.[param]) ? { ...acc, [param]: data[param] } : acc), {});
    }
  }

  selectData(): Observable<Data>;
  selectData<R = any>(param: string): Observable<R>;
  selectData(params: string[]): Observable<Data>;
  selectData(params?: string[] | string): Observable<any> {
    const data = this.activatedRoute.data;
    if (!params) {
      return data;
    } else if (isString(params)) {
      return data.pipe(pluck(params));
    } else if (isArray(params)) {
      return data.pipe(
        map(d => params.reduce((acc, param) => (!isNil(d?.[param]) ? { ...acc, [param]: d[param] } : acc), {}))
      );
    }
  }

  getFragment(): string {
    return this.activatedRoute.snapshot.fragment;
  }

  selectFragment(): Observable<string> {
    return this.activatedRoute.fragment;
  }
}
