import { getUniqueIds } from './index';

describe('getUniqueIds', () => {
  test('get unique', () => {
    const ids = getUniqueIds('companyId', [{
      companyId: '123'
    }, {
      companyId: '456'
    }, {
      companyId: '456'
    }]);

    expect(ids).toStrictEqual(['123', '456']);
  });

});
