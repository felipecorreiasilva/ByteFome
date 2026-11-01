import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import productRoutes from './routes/productRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

app.use(express.json());
app.use(cors());

// Rotas da API para produtos
app.use('/api/products', productRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API do ByteFome rodando com TypeScript 🚀' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});