import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import reportsRouter from './routes/reports.js';
import mrtLinesRouter from './routes/mrtLines.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/reports', reportsRouter);
app.use('/api/mrt-lines', mrtLinesRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
