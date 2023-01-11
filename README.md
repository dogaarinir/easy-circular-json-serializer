# easy-circular-json-serializer
Small and lightweight class for serialization and de-serialization of circular objects. If you provide factory methods, then the de-serialization is typesafe.

## Example
```Javascript
class PDMeta {
  public ergname: MLString | null = null;
  public name: string | null = null;
}

class PDAttributeMeta extends PDMeta {
  public required: boolean = false;
}

class Subsystem extends PDMeta {

  public types: PDTypeMeta[] = new Array<PDTypeMeta>();
  public application: PDApplication | null = null;
}


class PDTypeMeta extends PDMeta {
  public masterData: boolean = false;
  public objectIdentifier: string = '<id>';
  public singleton: boolean = false;
  public base: PDTypeMeta | null = null;
  public attributes: PDAttributeMeta[] = new Array<PDAttributeMeta>();
  public subsystem: Subsystem | null = null;
}

class PDApplication extends PDMeta {

  public types: PDTypeMeta[] = new Array<PDTypeMeta>();
  public navigationMenu: PDTypeMeta[] = new Array<PDTypeMeta>();
  public globalMenu: PDTypeMeta[] = new Array<PDTypeMeta>();
  public subsystems: Subsystem[] = new Array<Subsystem>();

  public get size(): number {
    return this.types.length;
  }
}
```

```Javascript
const mapper = new JSONObjectMapper();

mapper.addConstructorHandler("PDApplication", () => new PDApplication());
mapper.addConstructorHandler("MLString", () => new MLString());
mapper.addConstructorHandler("Subsystem", () => new Subsystem());
mapper.addConstructorHandler("PDTypeMeta", () => new PDTypeMeta());


test('JSON', () => {


  expect(application.size).toBe(1);

  const json = mapper.toJSON(application);
  // console.log(json);

  const deserialised:any = mapper.fromJSON(json);
  // console.log(deserialised);

  const json2 = mapper.toJSON(deserialised);
  // console.log(json2);
  expect(json.length).toBe(json2.length);

  // Same reference (test a)
  expect(deserialised.subsystems[0]).toBe(deserialised.types[0].subsystem);

  // Same reference (test b)
  deserialised.subsystems[0].name = "XYZ";
  expect(deserialised.types[0].subsystem.name).toBe("XYZ");

  expect(deserialised.size).toBe(1);


});

```