import { Injectable, OnDestroy } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  ActivationEnd,
  convertToParamMap,
  Data,
  Event,
  ParamMap,
  Params,
  Router,
} from '@angular/router';
import { BehaviorSubject, Observable, OperatorFunction, Subject } from 'rxjs';
import { auditTime, distinctUntilChanged, filter, map, pluck, takeUntil } from 'rxjs/operators';
import { isNil, isObjectEqualShallow, isString } from 'st-utils';

type ParamType = 'queryParamMap' | 'paramMap';

function isActivationEnd(event: Event): event is ActivationEnd {
  return event instanceof ActivationEnd;
}

function filterActvationEnd(): OperatorFunction<Event, ActivationEnd> {
  return filter(isActivationEnd);
}

/**
 * @description RouterQuery can be used to get the latest router params and data, even in the lowest level components
 */
@Injectable()
export class RouterQuery implements OnDestroy {
  constructor(activatedRoute: ActivatedRoute, private router: Router) {
    this._listenToRouteChanges();
    this._lastSnapshot = activatedRoute.snapshot;
  }

  private _lastSnapshot: ActivatedRouteSnapshot;

  private _destroy$ = new Subject<void>();

  // Not using State or Store here, because I don't want to emit everything when one separate thing changes
  private _params$ = new BehaviorSubject<Params>({});
  private _queryParams$ = new BehaviorSubject<Params>({});
  private _data$ = new BehaviorSubject<Data>({});

  private _listenToRouteChanges(): void {
    this.router.events.pipe(takeUntil(this._destroy$), filterActvationEnd(), auditTime(0)).subscribe(event => {
      let state = event.snapshot;
      this._lastSnapshot = state;
      const params: Params = {};
      const queryParams: Params = {};
      let data: Data = {};
      const fill = (): void => {
        for (const key of state.paramMap.keys) {
          params[key] = state.paramMap.get(key);
        }
        for (const key of state.queryParamMap.keys) {
          queryParams[key] = state.queryParamMap.get(key);
        }
        data = { ...data, ...state.data };
      };
      while (state.firstChild) {
        fill();
        state = state.firstChild;
      }
      fill();
      this._params$.next(params);
      this._queryParams$.next(queryParams);
      this._data$.next(data);
    });
  }

  private _getParamMap(type: ParamType): ParamMap {
    let params: Params;
    if (type === 'paramMap') {
      params = this._params$.value;
    } else {
      params = this._queryParams$.value;
    }
    return convertToParamMap(params);
  }

  private _selectParamMap(type: ParamType): Observable<ParamMap> {
    let params$: Observable<Params>;
    if (type === 'paramMap') {
      params$ = this._params$;
    } else {
      params$ = this._queryParams$;
    }
    return params$.pipe(
      distinctUntilChanged((paramsA, paramsB) => isObjectEqualShallow(paramsA, paramsB)),
      map(params => convertToParamMap(params))
    );
  }

  private _reduceParams(params: string[], paramMap: ParamMap): Params {
    return params.reduce((acc, param) => (paramMap.has(param) ? { ...acc, [param]: paramMap.get(param) } : acc), {});
  }

  private _getParamsBase(type: ParamType, params?: string | string[]): string | Params | null {
    const paramMap = this._getParamMap(type);
    if (!params) {
      return this._reduceParams(paramMap.keys, paramMap);
    } else if (isString(params)) {
      return paramMap.get(params);
    } else {
      return this._reduceParams(params, paramMap);
    }
  }

  private _selectParamsBase(
    type: ParamType,
    params?: string | string[]
  ): Observable<string | null> | Observable<Params> {
    const paramMap$ = this._selectParamMap(type);
    if (!params) {
      return paramMap$.pipe(map(paramsRoute => this._reduceParams(paramsRoute.keys, paramsRoute)));
    } else if (isString(params)) {
      return paramMap$.pipe(
        map(paramRoute => paramRoute.get(params)),
        distinctUntilChanged()
      );
    } else {
      return paramMap$.pipe(
        map(paramsRoute => this._reduceParams(params, paramsRoute)),
        distinctUntilChanged((paramsA, paramsB) => isObjectEqualShallow(paramsA, paramsB))
      );
    }
  }

  /**
   * @description Returns a snapshot of the current path params
   * @returns {Params}
   */
  getParams(): Params;
  /**
   * @description Returns a snapshot of a specific path param (can return null, if not found)
   * @param {string} param
   * @returns {string | null}
   */
  getParams(param: string): string | null;
  /**
   * @description Returns a snapshot of multiple path params as an object
   * @param {string[]} params
   * @returns {Params}
   */
  getParams(params: string[]): Params;
  getParams(params?: string | string[]): string | null | Params {
    return this._getParamsBase('paramMap', params);
  }

  /**
   * @description Returns a snapshot of a specific path param that appears multiple times in the path params
   * @param {string} param
   * @returns {string[]}
   */
  getAllParams(param: string): string[] {
    let state = this._lastSnapshot;
    const params = new Set<string>();
    while (state.firstChild) {
      if (state.paramMap.has(param)) {
        params.add(state.paramMap.get(param)!);
      }
      state = state.firstChild;
    }
    if (state.paramMap.has(param)) {
      params.add(state.paramMap.get(param)!);
    }
    return [...params];
  }

  /**
   * @description Returns an observable with all current path params
   * @returns {Observable<Params>}
   */
  selectParams(): Observable<Params>;
  /**
   * @description Returns an observable with a specific path params (can return observable of null if not found)
   * @param {string} param
   * @returns {Observable<string | null>}
   */
  selectParams(param: string): Observable<string | null>;
  /**
   * @description Returns an observable of multiple path params as an object
   * @param {string[]} params
   * @returns {Observable<Params>}
   */
  selectParams(params: string[]): Observable<Params>;
  selectParams(params?: string[] | string): Observable<string | null | Params> {
    return this._selectParamsBase('paramMap', params);
  }

  /**
   * @description Returns a snapshot of the current query params
   * @returns {Params}
   */
  getQueryParams(): Params;
  /**
   * @description Returns a snapshot of a specific query param param (can return null, if not found)
   * @param {string} param
   * @returns {string | null}
   */
  getQueryParams(param: string): string | null;
  /**
   * @description Returns a snapshot of multiple query params as an object
   * @param {string[]} params
   * @returns {Params}
   */
  getQueryParams(params: string[]): Params;
  getQueryParams(params?: string | string[]): string | null | Params {
    return this._getParamsBase('queryParamMap', params);
  }

  /**
   * @description Returns an observable with all current query params
   * @returns {Observable<Params>}
   */
  selectQueryParams(): Observable<Params>;
  /**
   * @description Returns an observable with a specific query params (can return observable of null if not found)
   * @param {string} param
   * @returns {Observable<string | null>}
   */
  selectQueryParams(param: string): Observable<string>;
  /**
   * @description Returns an observable of multiple query params as an object
   * @param {string[]} params
   * @returns {Observable<Params>}
   */
  selectQueryParams(params: string[]): Observable<Params>;
  selectQueryParams(params?: string[] | string): Observable<string | null | Params> {
    return this._selectParamsBase('queryParamMap', params);
  }

  getData(): Data;
  getData<R = unknown>(param: string): R | undefined;
  getData(params: string[]): Data;
  getData<R = unknown>(params?: string | string[]): R | undefined | Data {
    const data = this._data$.value;
    if (!params) {
      return data;
    } else if (isString(params)) {
      return data[params];
    } else {
      return params.reduce((acc, param) => (!isNil(data[param]) ? { ...acc, [param]: data[param] } : acc), {});
    }
  }

  /**
   * @description Returns an observable with all current data
   * @returns {Observable<Data>}
   */
  selectData(): Observable<Data>;
  /**
   * @description Returns an observable with a specific data (can return observable of undefined if not found)
   * @param {string} param
   * @returns {Observable<R | undefined>}
   */
  selectData<R = unknown>(param: string): Observable<R | undefined>;
  /**
   * @description Returns an observable of multiple data params as an object
   * @param {string[]} params
   * @returns {Observable<Data>}
   */
  selectData(params: string[]): Observable<Data>;
  selectData<R = unknown>(params?: string[] | string): Observable<R | Data | undefined> {
    const data$ = this._data$.asObservable();
    if (!params) {
      return data$;
    } else if (isString(params)) {
      return data$.pipe(pluck(params));
    } else {
      return data$.pipe(
        map(data => params.reduce((acc, param) => (!isNil(data[param]) ? { ...acc, [param]: data[param] } : acc), {}))
      );
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
