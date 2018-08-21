"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const routing_controllers_1 = require("routing-controllers");
const entity_1 = require("../users/entity");
const entity_2 = require("../events/entity");
const entity_3 = require("./entity");
const class_validator_1 = require("class-validator");
class validTicket {
}
__decorate([
    class_validator_1.IsString(),
    class_validator_1.Length(10, 100),
    __metadata("design:type", String)
], validTicket.prototype, "description", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsNumber(),
    __metadata("design:type", Number)
], validTicket.prototype, "price", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsUrl(),
    __metadata("design:type", String)
], validTicket.prototype, "thumbnail", void 0);
let TicketsController = class TicketsController {
    async getTickets(eventId) {
        const customers = await entity_1.Customer.query(`SELECT * FROM customers`);
        const ticketsInfo = await entity_3.TicketInfo.query('SELECT * FROM ticket_infos');
        const tickets = await entity_3.Ticket.query(`SELECT * FROM tickets WHERE event_id=${eventId}`);
        return { tickets, customers, ticketsInfo };
    }
    async getTicket(id) {
        return await entity_3.Ticket.query(`SELECT * FROM tickets WHERE id=${id}`);
    }
    async createTicket(eventId, ticket, user) {
        const event = await entity_2.default.findOne(eventId);
        if (!event)
            throw new routing_controllers_1.NotFoundError('Event not Found!');
        const entity = await entity_3.Ticket.create(ticket);
        entity.user = user;
        entity.event = event;
        const newTicket = await entity.save();
        await entity_3.TicketInfo.create({ ticket: newTicket }).save();
        const customer = await entity_1.Customer.findOne({ user: user });
        if (!customer)
            throw new routing_controllers_1.NotFoundError('Not a user');
        customer.ticketsOffered = customer.ticketsOffered + 1;
        await customer.save();
        const ticketsInfo = await entity_3.TicketInfo.query('SELECT * FROM ticket_infos');
        const [ticketPayload] = await entity_3.Ticket.query(`SELECT * FROM tickets WHERE id=${newTicket.id}`);
        const custommerPayload = await entity_1.Customer.query(`SELECT * FROM customers`);
        return { ticketPayload, custommerPayload, ticketsInfo };
    }
    async updateTicket(id, update) {
        const ticket = await entity_3.Ticket.findOne(id);
        if (!ticket)
            throw new routing_controllers_1.NotFoundError('Ticket not found!');
        const updatedTicket = await entity_3.Ticket.merge(ticket, update).save();
        const [payload] = await entity_3.Ticket.query(`SELECT * FROM tickets WHERE id=${updatedTicket.id}`);
        return payload;
    }
    async deleteTicket(id, user) {
        const ticket = await entity_3.Ticket.findOne(id);
        if (!ticket)
            throw new routing_controllers_1.NotFoundError('Ticket not found!');
        const customer = await entity_1.Customer.findOne({ user: user });
        if (!customer)
            throw new routing_controllers_1.NotFoundError('Not a user');
        customer.ticketsOffered = customer.ticketsOffered - 1;
        await customer.save();
        const custommerPayload = await entity_1.Customer.query(`SELECT * FROM customers`);
        await entity_3.Ticket.remove(ticket);
        return custommerPayload;
    }
};
__decorate([
    routing_controllers_1.Get('/events/:id([0-9]+)/tickets'),
    __param(0, routing_controllers_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "getTickets", null);
__decorate([
    routing_controllers_1.Get('/tickets/:id([0-9]+)'),
    __param(0, routing_controllers_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "getTicket", null);
__decorate([
    routing_controllers_1.Authorized(),
    routing_controllers_1.HttpCode(201),
    routing_controllers_1.Post('/events/:id([0-9]+)/tickets'),
    __param(0, routing_controllers_1.Param('id')),
    __param(1, routing_controllers_1.Body()),
    __param(2, routing_controllers_1.CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, validTicket,
        entity_1.User]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "createTicket", null);
__decorate([
    routing_controllers_1.Authorized(['Author']),
    routing_controllers_1.HttpCode(200),
    routing_controllers_1.Put('/tickets/:id([0-9]+)'),
    __param(0, routing_controllers_1.Param('id')),
    __param(1, routing_controllers_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "updateTicket", null);
__decorate([
    routing_controllers_1.Authorized(['Author']),
    routing_controllers_1.HttpCode(200),
    routing_controllers_1.Delete('/tickets/:id([0-9]+)'),
    __param(0, routing_controllers_1.Param('id')),
    __param(1, routing_controllers_1.CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, entity_1.User]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "deleteTicket", null);
TicketsController = __decorate([
    routing_controllers_1.JsonController()
], TicketsController);
exports.default = TicketsController;
//# sourceMappingURL=controller.js.map