export function groupBy<T>(array: T[], idGetter: (entity) => any): [T[keyof T], T[]][] {
  return array.reduce((acc, item) => {
    if (!acc.some(([id]) => id === idGetter(item))) {
      return [...acc, [idGetter(item), [item]]];
    } else {
      return acc.map(([id, items]) => {
        if (id === idGetter(item)) {
          return [id, [...items, item]];
        }
        return [id, items];
      });
    }
  }, []);
}
