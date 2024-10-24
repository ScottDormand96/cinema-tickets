import SeatReservationService from '../../../src/thirdparty/seatbooking/SeatReservationService.js' // Update with the correct path

describe('SeatReservationService', () => {
  describe('reserveSeat', () => {
    it('should not throw an error for valid inputs', () => {
      const seatReservationService = new SeatReservationService()
      expect(() => {
        seatReservationService.reserveSeat(123, 5)
      }).not.toThrow()
    })

    it.each([
      ['123'], [123.45], [null]
    ])('should throw TypeError when non-integer accountId is %s', async (id) => {
      const seatReservationService = new SeatReservationService()
      expect(() => {
        seatReservationService.reserveSeat(id, 5)
      }).toThrow(TypeError)
    })

    it.each([
      ['5'], [5.75], [null]
    ])('should throw TypeError when non-integer totalSeatsToAllocate is %s', async (seats) => {
      const seatReservationService = new SeatReservationService()
      expect(() => {
        seatReservationService.reserveSeat(123, seats)
      }).toThrow(TypeError)
    })
  })
})
