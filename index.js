import express from 'express'
import TicketService from './src/pairtest/TicketService.js'
import TicketTypeRequest from './src/pairtest/lib/TicketTypeRequest.js'

const app = express()
const port = 5000

app.use(express.json())

app.post('/purchase-tickets', (req, res) => {
  const { accountId, tickets } = req.body

  try {
    const ticketService = new TicketService()
    const ticketRequests = tickets.map(ticket => new TicketTypeRequest(ticket.type, ticket.quantity))

    ticketService.purchaseTickets(accountId, ...ticketRequests)

    res.status(200).json({ message: 'Tickets purchased successfully!' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`)
})
