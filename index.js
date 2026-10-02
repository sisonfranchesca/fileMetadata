var express = require('express');
var cors = require('cors');
require('dotenv').config();

var app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/fileanalyse', express.raw({ type: 'multipart/form-data', limit: '10mb' }), function (req, res) {
  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.includes('boundary=')) {
    return res.json({ error: 'Please upload a file' });
  }

  const boundary = contentType.split('boundary=')[1];
  const buffer = req.body;

  if (!buffer || buffer.length === 0) {
    return res.json({ error: 'Please upload a file' });
  }

  const bufferString = buffer.toString('binary');
  const filenameMatch = bufferString.match(/filename="([^"]+)"/);
  const typeMatch = bufferString.match(/Content-Type:\s*([^\r\n]+)/);

  if (!filenameMatch) {
    return res.json({ error: 'Please upload a file' });
  }

  const filename = filenameMatch[1];
  const mimetype = typeMatch ? typeMatch[1] : 'application/octet-stream';

  const headerEndIndex = bufferString.indexOf('\r\n\r\n') + 4;
  const footerStartIndex = bufferString.lastIndexOf(`\r\n--${boundary}`);
  const fileSize = footerStartIndex > headerEndIndex ? footerStartIndex - headerEndIndex : 0;

  res.json({
    name: filename,
    type: mimetype,
    size: fileSize
  });
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port);
});