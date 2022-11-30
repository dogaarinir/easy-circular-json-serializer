export class JSONObjectMapper {
  private static readonly refAttr: string = 'circRef';
  private static readonly refAttrId: string = JSONObjectMapper.refAttr + 'Id';

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
          ret[JSONObjectMapper.refAttr] = objectMap.get(value);
          return ret;
        }
        // no, so we will serialize and mark it, so we can remember it again.
        seen.add(value);
        value[JSONObjectMapper.refAttrId] = id;
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
  toJSON<T extends object>(source: T): string {
    return JSON.stringify(source, this._getCircularReplacer());
  }

  fromJSON<T extends object>(source: string): T {
    const objectMap = new Map();

    const obj = JSON.parse(source);

    const crawlObjectIds = (parent: any) => {
      for (const field in parent) {
        const value = parent[field];
        if (field === JSONObjectMapper.refAttrId) {
          objectMap.set(value, parent);
        } else if (value != null && typeof value === 'object') {
          crawlObjectIds(value);
        }
      }
    };
    crawlObjectIds(obj);

    const replaceCircularReferences = (parent: any) => {
      for (const field in parent) {
        const value = parent[field];

        if (value != null && typeof value === 'object') {
          const circleRef = value[JSONObjectMapper.refAttr];
          if (value !== null && circleRef !== null && circleRef !== undefined) {
            const replaceWith = objectMap.get(circleRef);
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
