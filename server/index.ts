import express from 'express';
import { MessagingResponse } from 'twilio/lib/twiml/MessagingResponse';

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post('/whatsapp', (req, res) => {
  const twiml = new MessagingResponse();
  const msg = req.body.Body?.toLowerCase() || '';

  if (msg === 'hola') {
    twiml.message('¡Hola! Escribe "stock" para ver inventario.');
  } else if (msg === 'stock') {
    twiml.message('Stock actual: 100 unidades.');
  } else {
    twiml.message('No entendí. Usa "hola" o "stock".');
  }

  res.type('text/xml').send(twiml.toString());
});

const port = parseInt(process.env.PORT || '5000', 10);
app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});
