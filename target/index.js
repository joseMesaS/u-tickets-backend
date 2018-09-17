"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const routing_controllers_1 = require("routing-controllers");
const Koa = require("koa");
const http_1 = require("http");
const dbs_1 = require("./dbs");
const jwt_1 = require("./jwt");
const entity_1 = require("./users/entity");
const entity_2 = require("./tickets/entity");
const controller_1 = require("./logins/controller");
const controller_2 = require("./comments/controller");
const controller_3 = require("./events/controller");
const controller_4 = require("./tickets/controller");
const controller_5 = require("./users/controller");
const app = new Koa();
const server = new http_1.Server(app.callback());
const port = process.env.PORT || 4000;
routing_controllers_1.useKoaServer(app, {
    cors: true,
    controllers: [
        controller_1.default,
        controller_2.default,
        controller_3.default,
        controller_4.default,
        controller_5.default
    ],
    authorizationChecker: async (action, roles) => {
        const header = action.request.headers.authorization;
        if (header && header.startsWith('Bearer ')) {
            const [, token] = header.split(' ');
            try {
                const { id } = jwt_1.verify(token);
                const user = await entity_1.User.findOne(id);
                if (!user)
                    throw new routing_controllers_1.NotFoundError('User not found!');
                if (roles.length) {
                    const [role] = roles;
                    switch (role) {
                        case 'admin':
                            return !!(user && user.admin);
                        case 'Author':
                            const [, , ticketId,] = action.request.path.split('/');
                            const ticket = await entity_2.Ticket.findOne(Number(ticketId), { relations: ["user"] });
                            if (!ticket)
                                throw new routing_controllers_1.NotFoundError('Ticket not found!');
                            return !!(ticket && (ticket.user.id === user.id));
                        default:
                            break;
                    }
                }
                else {
                    return !!(token && jwt_1.verify(token));
                }
            }
            catch (e) {
                throw new routing_controllers_1.BadRequestError(e);
            }
        }
        return false;
    },
    currentUserChecker: async (action) => {
        const header = action.request.headers.authorization;
        if (header && header.startsWith('Bearer ')) {
            const [, token] = header.split(' ');
            if (token) {
                const { id } = jwt_1.verify(token);
                return entity_1.User.findOne(id);
            }
        }
        return undefined;
    }
});
dbs_1.default()
    .then(_ => {
    server.listen(port);
    console.log(`Listening on port ${port}`);
})
    .catch(err => console.error(err));
//# sourceMappingURL=index.js.map