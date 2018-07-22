const express = require('express');
const compression = require('compression');
const app = express();

app.use(compression());
app.use(express.static('public'));

let port = 8000;
app.listen(port, () => console.log('Restaurant review site listening on port ' + port));
