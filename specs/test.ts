import  {JSONObjectMapper}  from "../src/jsonobjectmapper";

const mapper = new JSONObjectMapper();

test('JSON1', () => {
  expect(mapper.toJSON({ b: 47 })).toBe('{"b":47,"circRefId":1,"circRefCN":"Object"}');
});
