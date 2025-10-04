const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oeyfvq1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let coffeesCollection;

async function run() {
    try {
        await client.connect();
        coffeesCollection = client.db('coffeeDB').collection('coffees');

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        app.listen(port, () => {
            console.log(`Coffee server is running on port ${port}`);
        });

    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    }
}

app.get('/coffees', async (req, res) => {
    try {
        const result = await coffeesCollection.find().toArray();
        res.send(result);
    } catch (error) {
        console.error("Error fetching coffees:", error);
        res.status(500).send({ error: 'Failed to fetch coffees' });
    }
});

app.get('/coffees/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await coffeesCollection.findOne(query);
    res.send(result);
})

app.post('/coffees', async (req, res) => {
    try {
        const newCoffee = req.body;
        console.log(newCoffee);
        const result = await coffeesCollection.insertOne(newCoffee);
        res.send(result);
    } catch (error) {
        console.error("Error adding coffee:", error);
        res.status(500).send({ error: 'Failed to add coffee' });
    }
});

app.delete('/coffees/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await coffeesCollection.deleteOne(query);
    res.send(result);
})

app.get('/', (req, res) => {
    res.send('Coffee server is getting hotter.');
});

run().catch(console.dir);