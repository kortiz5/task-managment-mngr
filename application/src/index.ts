import express, { Application } from 'express';
import router from './routes/routes';
import config from '../config/config';
import cors from 'cors';

const app: Application = express();


app.use(cors());
app.use(express.json());
app.use(router);
const PORT = config.port
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
