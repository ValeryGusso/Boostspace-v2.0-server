import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToGSS } from './utils.js';
dotenv.config();
const doc = await connectToGSS(process.env.GOOGLE_SHEET_ID);
console.log(doc?.title);
const app = express();
app.use(cors({
    credentials: true,
    origin: true,
}));
app.get('/', (req, res) => res.json({ message: 'its work' }));
app.listen(process.env.PORT, () => console.log('Server UP!'));
//# sourceMappingURL=index.js.map