import express from 'express';
import 'dotenv/config';


const { PORT } = process.env;

// Insure environment variables are set
if (!PORT) {
  throw new Error('Environment variables are not set properly');
}


const app = express();
app.use(express.json());


(async () => {
  app.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
  });
})();
