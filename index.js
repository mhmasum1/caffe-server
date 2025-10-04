const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;



app.use(cors());
app.use(express());

app.get('/', (req, res) => {
    res.send('Coffe server is getting hotter.');
})

app.listen(port, () => {
    console.log(`Coffe server is running on port ${port}`)
})