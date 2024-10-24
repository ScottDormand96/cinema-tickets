import TicketService from '../../src/pairtest/TicketService.js'
import TicketTypeRequest from '../../src/pairtest/lib/TicketTypeRequest.js'
import InvalidPurchaseException from '../../src/pairtest/lib/InvalidPurchaseException.js'
import SeatReservationService from '../../src/thirdparty/seatbooking/SeatReservationService.js'
import TicketPaymentService from '../../src/thirdparty/paymentgateway/TicketPaymentService.js'

jest.mock('../../src/thirdparty/seatbooking/SeatReservationService.js', () => ({
  reserveSeat: jest.fn()
}))

jest.mock('../../src/thirdparty/paymentgateway/TicketPaymentService.js', () => ({
  makePayment: jest.fn()
}))


describe('TicketService', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Invalid purchase exceptions', () => {
    it('throws InvalidPurchaseException if account ID is not a number', () => {
      const ticketService = new TicketService()
      const accountId = 'abc'
      const adultTicketRequest = new TicketTypeRequest('ADULT', 1)

      expect(() => {
        ticketService.purchaseTickets(accountId, adultTicketRequest)
      }).toThrow(InvalidPurchaseException)
    })

    it('throws InvalidPurchaseException if account ID <= 0', () => {
      const ticketService = new TicketService()
      const accountId = -1
      const adultTicketRequest = new TicketTypeRequest('ADULT', 1)

      expect(() => {
        ticketService.purchaseTickets(accountId, adultTicketRequest)
      }).toThrow(InvalidPurchaseException)
    })

    it('throws InvalidPurchaseException for invalid ticket type', () => {
      const ticketService = new TicketService()
      const accountId = 1
      const invalidTicketRequest = { getTicketType: () => 'INVALID', getNoOfTickets: () => 1 }

      expect(() => {
        ticketService.purchaseTickets(accountId, invalidTicketRequest)
      }).toThrow(InvalidPurchaseException)
    })

    it('throws InvalidPurchaseException if child tickets without adult tickets', () => {
      const ticketService = new TicketService()
      const accountId = 1
      const childTicketRequest = new TicketTypeRequest('CHILD', 1)

      expect(() => {
        ticketService.purchaseTickets(accountId, childTicketRequest)
      }).toThrow(InvalidPurchaseException)
    })

    it('throws InvalidPurchaseException if infant tickets without adult tickets', () => {
      const ticketService = new TicketService()
      const accountId = 1
      const infantTicketRequest = new TicketTypeRequest('INFANT', 1)

      expect(() => {
        ticketService.purchaseTickets(accountId, infantTicketRequest)
      }).toThrow(InvalidPurchaseException)
    })

    it('throws InvalidPurchaseException if total tickets exceed 25 (excluding infants)', () => {
      const ticketService = new TicketService()
      const accountId = 1
      const adultTicketRequest = new TicketTypeRequest('ADULT', 26)

      expect(() => {
        ticketService.purchaseTickets(accountId, adultTicketRequest)
      }).toThrow(InvalidPurchaseException)
    })
  })

  describe('Calls to external services', () => {
    it('calls makePayment with correct accountId and totalAmountToPay', () => {
      const ticketService = new TicketService()
      const accountId = 1
      const adultTicketRequest = new TicketTypeRequest('ADULT', 1)

      ticketService.purchaseTickets(accountId, adultTicketRequest)

      expect(TicketPaymentService.makePayment).toHaveBeenCalledWith(accountId, 25)
    })

    it('calls reserveSeat with correct accountId and totalSeatsToAllocate', () => {
      const ticketService = new TicketService()
      const accountId = 1
      const adultTicketRequest = new TicketTypeRequest('ADULT', 3)

      ticketService.purchaseTickets(accountId, adultTicketRequest)

      expect(SeatReservationService.reserveSeat).toHaveBeenCalledWith(accountId, 3)
    })

    it('calls getTicketType and getNoOfTickets', () => {
      const ticketService = new TicketService()
      const adultTicketRequest = new TicketTypeRequest('ADULT', 1)
      const getTicketTypeSpy = jest.spyOn(adultTicketRequest, 'getTicketType')

      ticketService.purchaseTickets(1, adultTicketRequest)

      expect(getTicketTypeSpy).toHaveBeenCalled()
    })

    it('calls getNoOfTickets', () => {
      const ticketService = new TicketService()
      const adultTicketRequest = new TicketTypeRequest('ADULT', 1)
      const getNoOfTicketsSpy = jest.spyOn(adultTicketRequest, 'getNoOfTickets')

      ticketService.purchaseTickets(1, adultTicketRequest)

      expect(getNoOfTicketsSpy).toHaveBeenCalled()
    })
  })

  describe('Successful scenarios', () => {
    it.each([
        [25, 1],
        [100, 4],
        [175, 7],
    ])('totalAmountToPay should equal %s when buying %s adult ticket', async (pay, adult) => {
      const ticketService = new TicketService()
      const accountId = 1
      const adultTicketRequest = new TicketTypeRequest('ADULT', adult)

      ticketService.purchaseTickets(accountId, adultTicketRequest)

      expect(TicketPaymentService.makePayment).toHaveBeenCalledWith(accountId, pay)
    })

    it.each([
        [40, 1, 1],
        [145, 4, 3],
        [235, 7, 4],
    ])('totalAmountToPay should equal %s when buying %s adult ticket and %s child ticket', async (pay, adult, child) => {
      const ticketService = new TicketService()
      const accountId = 1
      const adultTicketRequest = new TicketTypeRequest('ADULT', adult)
      const childTicketRequest = new TicketTypeRequest('CHILD', child)

      ticketService.purchaseTickets(accountId, adultTicketRequest, childTicketRequest)

      expect(TicketPaymentService.makePayment).toHaveBeenCalledWith(accountId, pay)
    })

    it.each([
        [40, 1, 1, 1],
        [145, 4, 3, 3],
        [235, 7, 4, 4],
        [200, 8, 0, 8]
    ])('totalAmountToPay should equal %s when buying %s adult ticket, %s child ticket and %s infant ticket', async (pay, adult, child, infant) => {
      const ticketService = new TicketService()
      const accountId = 1
      const adultTicketRequest = new TicketTypeRequest('ADULT', adult)
      const childTicketRequest = new TicketTypeRequest('CHILD', child)
      const infantTicketRequest = new TicketTypeRequest('INFANT', infant)

      ticketService.purchaseTickets(accountId, adultTicketRequest, childTicketRequest, infantTicketRequest)

      expect(TicketPaymentService.makePayment).toHaveBeenCalledWith(accountId, pay)
    })

    it.each([
        [1, 1],
        [4, 4],
        [7, 7],
    ])('totalSeatsToAllocate should equal %s when buying %s adult ticket', async (seats, adult) => {
      const ticketService = new TicketService()
      const accountId = 1
      const adultTicketRequest = new TicketTypeRequest('ADULT', adult)

      ticketService.purchaseTickets(accountId, adultTicketRequest)

      expect(SeatReservationService.reserveSeat).toHaveBeenCalledWith(accountId, seats)
    })

    it.each([
        [2, 1, 1],
        [7, 4, 3],
        [11, 7, 4],
    ])('totalSeatsToAllocate should equal %s when buying %s adult ticket and %s child ticket', async (seats, adult, child) => {
      const ticketService = new TicketService()
      const accountId = 1
      const adultTicketRequest = new TicketTypeRequest('ADULT', adult)
      const childTicketRequest = new TicketTypeRequest('CHILD', child)

      ticketService.purchaseTickets(accountId, adultTicketRequest, childTicketRequest)

      expect(SeatReservationService.reserveSeat).toHaveBeenCalledWith(accountId, seats)
    })

    it.each([
        [2, 1, 1, 1],
        [7, 4, 3, 3],
        [11, 7, 4, 4],
        [8, 8, 0, 8]
    ])('totalSeatsToAllocate should equal %s when buying %s adult ticket, %s child ticket and %s infant ticket', async (seats, adult, child, infant) => {
      const ticketService = new TicketService()
      const accountId = 1
      const adultTicketRequest = new TicketTypeRequest('ADULT', adult)
      const childTicketRequest = new TicketTypeRequest('CHILD', child)
      const infantTicketRequest = new TicketTypeRequest('INFANT', infant)

      ticketService.purchaseTickets(accountId, adultTicketRequest, childTicketRequest, infantTicketRequest)

      expect(SeatReservationService.reserveSeat).toHaveBeenCalledWith(accountId, seats)
    })

    it('does not throw InvalidPurchaseException if total seats for adult and children is 25 plus infants', () => {
      const ticketService = new TicketService()
        const accountId = 1
        const adultTicketRequest = new TicketTypeRequest('ADULT', 25)
        const infantTicketRequest = new TicketTypeRequest('INFANT', 1)
  
        expect(() => {
          ticketService.purchaseTickets(accountId, adultTicketRequest, infantTicketRequest)
        }).not.toThrow(InvalidPurchaseException)
      })
  })
})
