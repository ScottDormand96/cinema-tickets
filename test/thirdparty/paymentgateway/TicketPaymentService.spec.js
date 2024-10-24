import TicketPaymentService from '../../../src/thirdparty/paymentgateway/TicketPaymentService.js'

describe('TicketPaymentService', () => {
  describe('makePayment', () => {
    it('should not throw an error for valid inputs', () => {
      const ticketPaymentService = new TicketPaymentService()
      expect(() => {
        ticketPaymentService.makePayment(123, 50)
      }).not.toThrow()
    })

    it.each([
        ['123'], [123.45], [null]
    ])('should throw TypeError when non-integer accountId is %s', async (id) => {
      const ticketPaymentService = new TicketPaymentService()
      expect(() => {
        ticketPaymentService.makePayment(id, 50)
      }).toThrow(TypeError)
    })

    it.each([
        ['50'], [50.75], [null]
    ])('should throw TypeError when non-integer totalAmountToPay is %s', async (pay) => {
      const ticketPaymentService = new TicketPaymentService()
      expect(() => {
        ticketPaymentService.makePayment(123, pay)
      }).toThrow(TypeError)
    })
  })
})
