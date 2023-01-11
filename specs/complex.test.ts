import  {JSONObjectMapper}  from "../src/jsonobjectmapper";


class SVG {
  public definition: string | null = null;
}


class MLString {
  public de: string | null = null;
  public en: string | null = null;
  public nl: string | null = null;
  public tr: string | null = null;

  public static create(de: string): MLString {
    const ret: MLString = new MLString();
    ret.de = de;
    return ret;
  }
}

class PDMeta {
  public ergname: MLString | null = null;
  public name: string | null = null;
}


class PDMemberMeta extends PDMeta {
}
class PDAttributeMeta extends PDMemberMeta {
  public required: boolean = false;
}


class Subsystem extends PDMeta {

  public types: PDTypeMeta[] = new Array<PDTypeMeta>();

  public application: PDApplication | null = null;
}


class PDTypeMeta extends PDMeta {
  public ergnamePlural: MLString | null = null;
  public icon: SVG | null = null;
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

const application = new PDApplication();
application.ergname = MLString.create('Angebotsmanagement');
application.name = "Angebotsmanagement"
const ssAngebote: Subsystem = new Subsystem();
ssAngebote.ergname = MLString.create('Angebote');
ssAngebote.name = 'Angebote';
ssAngebote.application = application;
const ssKontakte: Subsystem = new Subsystem();
ssKontakte.ergname = MLString.create('Kontakte');
ssKontakte.name = 'Kontakte';
ssKontakte.application = application;

const angebot: PDTypeMeta = new PDTypeMeta();
angebot.ergname = MLString.create('Angebot');
angebot.name = 'Angebot';
angebot.ergnamePlural = MLString.create('Angebote');
angebot.objectIdentifier = '{{Nummer}} {{Datum}}';
angebot.subsystem = ssAngebote;

ssAngebote.types.push(angebot);

application.types.push(angebot);

application.subsystems.push(ssAngebote);
application.subsystems.push(ssKontakte);


const mapper = new JSONObjectMapper();

mapper.addConstructorHandler("PDApplication", () => new PDApplication());
mapper.addConstructorHandler("MLString", () => new MLString());
mapper.addConstructorHandler("Subsystem", () => new Subsystem());
mapper.addConstructorHandler("PDTypeMeta", () => new PDTypeMeta());

test('JSON2', () => {


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
