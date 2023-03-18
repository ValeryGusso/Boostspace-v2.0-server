import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import expressWS from 'express-ws';
import * as DataController from './controllers/data.js';
import * as PlayerController from './controllers/player.js';
import * as AuthController from './controllers/auth.js';
import { connectToPostgres } from './utils.js';
import { checkAuth } from './middlewares/checkAuth.js';
import { checkAdmin } from './middlewares/checkAdmin.js';
dotenv.config();
const app = express();
const WS = expressWS(app);
const wsServer = WS.getWss();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: true,
}));
WS.app.ws('/', (webSocket) => {
    webSocket.on('open', () => {
        console.log('Socket open');
    });
    webSocket.on('close', () => {
        console.log('Socket close');
    });
    webSocket.on('message', (msg) => {
        if (msg.toString() === 'updated') {
            wsServer.clients.forEach((client) => {
                client.send('updated');
            });
        }
    });
});
app.get('/data', checkAuth, DataController.getData);
app.get('/data/calculate', checkAuth, DataController.calculatePeriod);
app.get('/data/payment', checkAuth, DataController.getPayment);
app.get('/data/total', checkAuth, DataController.getTotal);
app.get('/auth/me', checkAuth, AuthController.getMe);
app.get('/auth/logout', checkAuth, AuthController.logout);
app.get('/auth/refresh', AuthController.refresh);
app.post('/auth/reg', AuthController.registration);
app.post('/auth/login', AuthController.login);
app.post('/auth/activate', AuthController.activate);
app.get('/users', checkAuth, PlayerController.getAll);
app.post('/users/get', checkAuth, PlayerController.getOne);
app.post('/users/player', checkAuth, PlayerController.updatePlayer);
app.post('/users/character', checkAuth, PlayerController.updateCharacter);
app.post('/users/admin', checkAdmin, PlayerController.updateByAdmin);
app.post('/users/invite', checkAdmin, PlayerController.invite);
(async () => {
    try {
        await connectToPostgres();
        app.listen(process.env.PORT, () => console.log('Server UP!'));
    }
    catch (err) {
        console.log(err);
    }
})();
//# sourceMappingURL=index.js.map