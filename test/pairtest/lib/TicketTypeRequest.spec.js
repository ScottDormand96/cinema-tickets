import TicketTypeRequest from '../../../src/pairtest/lib/TicketTypeRequest.js'

describe('TicketTypeRequest', () => {
  describe('constructor', () => {
    describe('should create an instance when valid input', () => {
        const ticketTypeRequest = new TicketTypeRequest('ADULT', 3)
        it('is an instance of TicketTypeRequest', () => {
            expect(ticketTypeRequest).toBeInstanceOf(TicketTypeRequest)
        })
      
        it('has %s number of tickets', () => {
            expect(ticketTypeRequest.getNoOfTickets()).toBe(3)
        })

        it('is an instance of TicketTypeRequest', () => {
            expect(ticketTypeRequest.getTicketType()).toBe('ADULT')
        })
    })

    describe('invalid type', () => {
        it.each([
            ['TEENAGER'], ['SENIOR'], ['INVALID']
        ])('should throw TypeError for invalid type %s', (type) => {
            try {
            new TicketTypeRequest(type, 1)
            } catch (error) {
                expect(error).toBeInstanceOf(TypeError)
            }
        })

        it.each([
            ['TEENAGER'], ['SENIOR'], ['INVALID']
        ])('should throw type error message for invalid type %s', (type) => {
            try {
            new TicketTypeRequest(type, 1)
            } catch (error) {
                expect(error.message).toBe('type must be ADULT, CHILD, or INFANT')
            }
        })
    })
  
    describe('invalid number of tickets', () => {
        it.each([
            [2.5], ['three'], [null], [undefined]
        ])('should throw TypeError when noOfTickets is %s', (noOfTickets) => {
            try {
            new TicketTypeRequest('ADULT', noOfTickets)
            } catch (error) {
                expect(error).toBeInstanceOf(TypeError)
            }
        })

        it.each([
            [2.5], ['three'], [null], [undefined]
        ])('should throw number of tickets error message when noOfTickets is %s', (noOfTickets) => {
            try {
            new TicketTypeRequest('ADULT', noOfTickets)
            } catch (error) {
                expect(error.message).toBe('noOfTickets must be an integer')
            }
        })
    })
  })

  describe('getNoOfTickets', () => {
    it.each([
        [1], [5], [11]
    ])('should return %s number of tickets', (noOfTickets) => {
      const ticketTypeRequest = new TicketTypeRequest('ADULT', noOfTickets)
      expect(ticketTypeRequest.getNoOfTickets()).toBe(noOfTickets)
    })
  })

  describe('getTicketType', () => {
    it.each([
        ['ADULT'], ['CHILD'], ['INFANT']
    ])('should return %s ticket type', (type) => {
      const ticketTypeRequest = new TicketTypeRequest(type, 1)
      expect(ticketTypeRequest.getTicketType()).toBe(type)
    })
  })
})
