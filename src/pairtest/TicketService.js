import { ADULT_TICKET_PRICE, CHILD_TICKET_PRICE, MAX_TICKETS } from './../constants.js'
import InvalidPurchaseException from './lib/InvalidPurchaseException.js'
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js'
import TicketPaymentService from './../thirdparty/paymentgateway/TicketPaymentService.js'
import TicketTypeRequest from './lib/TicketTypeRequest.js'

export default class TicketService {
  constructor() {
    this.ticketPaymentService = new TicketPaymentService();
    this.seatReservationService = new SeatReservationService();
  }

  /**
   * Main method for purchasing tickets
   * @param {number} accountId - The account ID of the purchaser
   * @param {TicketTypeRequest[]} ticketTypeRequests - The requested tickets
   * @throws InvalidPurchaseException if validation fails
  */
  purchaseTickets(accountId, ...ticketTypeRequests) {
    if (!Number.isInteger(accountId) || accountId <= 0) {
      throw new InvalidPurchaseException('Invalid account ID')
    }

    // Calculate the total amount and seats to allocate
    const { totalAmountToPay, totalSeatsToAllocate } = this.#processTicketRequests(ticketTypeRequests)

    // Make payment
    this.ticketPaymentService.makePayment(accountId, totalAmountToPay)

    // Reserve seats
    this.seatReservationService.reserveSeat(accountId, totalSeatsToAllocate)
  }

  /**
   * Validates and calculates the total amount to pay and the total seats to allocate
   * @param {TicketTypeRequest[]} ticketTypeRequests - Array of ticket requests
   * @returns {{totalAmountToPay: number, totalSeatsToAllocate: number}}
   * @throws InvalidPurchaseException if the purchase request is invalid
  */
  #processTicketRequests(ticketTypeRequests) {
    let numAdultTickets = 0
    let numChildTickets = 0
    let numInfantTickets = 0
    let totalAmountToPay = 0
    let totalSeatsToAllocate = 0

    for (const request of ticketTypeRequests) {
      const ticketType = request.getTicketType()
      const numberOfTickets = request.getNoOfTickets()

      switch (ticketType) {
        case 'ADULT':
          numAdultTickets += numberOfTickets
          totalAmountToPay += numberOfTickets * ADULT_TICKET_PRICE
          totalSeatsToAllocate += numberOfTickets
          break
        case 'CHILD':
          numChildTickets += numberOfTickets
          totalAmountToPay += numberOfTickets * CHILD_TICKET_PRICE
          totalSeatsToAllocate += numberOfTickets
          break
        case 'INFANT':
          numInfantTickets += numberOfTickets
          break
        default:
          throw new InvalidPurchaseException('Unknown ticket type')
      }
    }

    if (numChildTickets > 0 && numAdultTickets === 0) {
      throw new InvalidPurchaseException('Cannot purchase Child tickets without Adult tickets')
    }

    if (numInfantTickets > 0 && numAdultTickets === 0) {
      throw new InvalidPurchaseException('Cannot purchase Infant tickets without Adult tickets')
    }

    const totalTicketsExcludingInfants = numAdultTickets + numChildTickets
    if (totalTicketsExcludingInfants > MAX_TICKETS) {
      throw new InvalidPurchaseException('Cannot purchase more than 25 tickets excluding infants')
    }

    return {
      totalAmountToPay,
      totalSeatsToAllocate
    }
  }  
}
