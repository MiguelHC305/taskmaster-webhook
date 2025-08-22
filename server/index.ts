import express from 'express';
import bodyParser from 'body-parser';
import { MessagingResponse } from 'twilio';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/webhook', (req, res) => {
  const twiml = new MessagingResponse();
  const msg = req.body.Body?.toLowerCase() || '';

  if (msg.includes('stock')) {
    twiml.message('📦 Hay 25 unidades disponibles en el almacén.');
  } else if (msg.includes('venta')) {
    twiml.message('🧾 Venta registrada con éxito.');
  } else {
    twiml.message('🤖 Hola, soy TaskMaster. Puedes escribirme "stock", "venta" o "disponibilidad".');
  }

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor escuchando en el puerto ${PORT}`));
