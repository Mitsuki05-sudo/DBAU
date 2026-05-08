import express from 'express';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Backend SGEC opérationnel !');
});

app.listen(port, () => {
  console.log(`Serveur prêt sur http://localhost:${port}`);
});