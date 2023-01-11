export class JSONObjectMapper {
  private static readonly refAttr: string = 'circRef';
  private static readonly refAttrId: string = JSONObjectMapper.refAttr + 'Id';
  private static readonly refAttrClass: string = JSONObjectMapper.refAttr + "CN";

  private factories: Map<String, () => Object> = new Map();

  /**
   * 
   * @param name The name must correspond to the name of the objects constructor which will be serialised in the 
   * attribute 'refAttrClass'
   * @param factory A factory method which is responsible to create a new instance of that type.
   */
  public addConstructorHandler(name: String, factory: () => Object) {
    this.factories.set(name, factory);
  }

  /**
   *
   * @returns A replacer function, which returns primitive values as they are
   * and maps complex objects to a reference.
   */
  private _getCircularReplacer: any = () => {
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
        if (value.constructor != undefined && value.constructor.name != undefined) {
          value[JSONObjectMapper.refAttrClass] = value.constructor.name;
        }
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

    // The first step is a basic JSON parse which will only return generic Object instances.
    let obj = JSON.parse(source);

    // private method "crawlObjectIds" which is also responsible for cloning type safe instances.
    const crawlObjectIds = (parent: any): any => {
      let parentClone: any = parent;
      let parentRefId: number | null = null;

      for (const field in parent) {
        const value = parent[field];
        if (field === JSONObjectMapper.refAttrId) {
          objectMap.set(value, parentClone);
          // We need to save this objects reference id if we need to clone that instance.
          // In this case, we will update the objectMap-cache.
          parentRefId = value;
        } else if (value != null && typeof value === 'object') {
          const valueClone = crawlObjectIds(value);
          if (value != valueClone) {
            parent[field] = valueClone;
          }
        } else if (field === JSONObjectMapper.refAttrClass && this.factories.has(value)) {
          // we know this class and have a factory to create a typesafe instance from the generic Object instance.
          const factory: (() => Object) | undefined = this.factories.get(value);
          if (factory != null && factory != undefined) {
            parentClone = factory() as any;
            // copy all properties from the source to the typesafe clone instance.
            for (var attr in parent) {
              if (parent.hasOwnProperty(attr)) {
                parentClone[attr] = parent[attr];
                if (parentRefId != null) {
                  objectMap.set(parentRefId, parentClone);
                }
              }
            }
          }          
        }
      }
      return parentClone;
    };
    obj = crawlObjectIds(obj);

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
