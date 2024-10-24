import InvalidPurchaseException from '../../../src/pairtest/lib/InvalidPurchaseException.js'

describe('InvalidPurchaseException', () => {
  it('should be an instance of InvalidPurchaseException', () => {
    const exception = new InvalidPurchaseException('Test error')
    expect(exception).toBeInstanceOf(InvalidPurchaseException)
  })

  it('should be an instance of Error', () => {
    const exception = new InvalidPurchaseException('Test error')
    expect(exception).toBeInstanceOf(Error)
  })

  it('should set the correct message', () => {
    const message = 'Test error message'
    const exception = new InvalidPurchaseException(message)
    expect(exception.message).toBe(message)
  })

  it('should have the correct name property', () => {
    const exception = new InvalidPurchaseException('Test error')
    expect(exception.name).toBe('Error')
  })
})
