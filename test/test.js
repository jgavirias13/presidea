var assert = require('assert');

describe('Basic Mocha String Test', ()=>{
  it('should return number of characters is 5', () => {
    assert.equal("Hello".length, 5);
  });
});
