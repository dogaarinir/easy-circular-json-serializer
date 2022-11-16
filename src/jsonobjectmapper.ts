export class JSONObjectMapper<T> {
  static readonly _ref_attr: string = 'circRef';
  static readonly _ref_attr_id: string = JSONObjectMapper._ref_attr + 'Id';

  /**
   *
   * @returns A replacer function, which returns primitive values as they are
   * and maps complex objects to a reference.
   */
  _getCircularReplacer: any = () => {
    const seen = new WeakSet();
    const objectMap = new Map();
    let id = 1;
    return (key: any, value: any) => {
      if (typeof value === 'object' && value !== null) {
        // the value is an object. Have we ever seen it before?
        if (seen.has(value)) {
          // yes, so we do not need to serialize it again. Just return an recursiveRef-instance.
          const ret: any = {};
          ret[JSONObjectMapper._ref_attr] = objectMap.get(value);
          return ret;
        }
        // no, so we will serialize and mark it, so we can remember it again.
        seen.add(value);
        value[JSONObjectMapper._ref_attr_id] = id;
        objectMap.set(value, id++);
      }
      return value;
    };
  };

  /**
   *
   * @param source An object which may contain recursive references.
   * @returns
   */
  toJSON(source: T): string {
    return JSON.stringify(source, this._getCircularReplacer());
  }

  fromJSON(source: string): T {
    const objectMap = new Map();

    let obj = JSON.parse(source);

    let crawlObjectIds = (parent: any) => {
      for (let field in parent) {
        let value = parent[field];
        if (field === JSONObjectMapper._ref_attr_id) {
          objectMap.set(value, parent);
        } else if (value != null && typeof value === 'object') {
          crawlObjectIds(value);
        }
      }
    };
    crawlObjectIds(obj);

    let replaceCircularReferences = (parent: any) => {
      for (let field in parent) {
        let value = parent[field];

        if (value != null && typeof value === 'object') {
          const circleRef = value[JSONObjectMapper._ref_attr];
          if (value != null && circleRef != null && circleRef != undefined) {
            let replaceWith = objectMap.get(circleRef);
            parent[field] = replaceWith;
          } else {
            replaceCircularReferences(value);
          }
        }
      }
    };
    replaceCircularReferences(obj);
    return obj;
  }
}
