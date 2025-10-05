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
let usersCollection;

async function run() {
    try {
        await client.connect();
        coffeesCollection = client.db('coffeeDB').collection('coffees');
        usersCollection = client.db('coffeeDB').collection('users')

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
});

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

app.put('/coffees/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) }
    const options = { upsert: true };
    const updateCoffee = req.body;
    const updateDoc = {
        $set: updateCoffee
    }
    const result = await coffeesCollection.updateOne(filter, updateDoc, options);
    res.send(result);

})

app.delete('/coffees/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await coffeesCollection.deleteOne(query);
    res.send(result);
});

// User related APIs

app.get('/users', async (req, res) => {
    const result = await usersCollection.find().toArray();
    res.send(result);
})

app.post('/users', async (req, res) => {
    const userProfile = req.body;
    console.log(userProfile);
    const result = await usersCollection.insertOne(userProfile);
    res.send(result);
})

app.patch('/users', async (req, res) => {
    const { email, lastSignInTime } = req.body;
    const filter = { email: email }
    const updateDoc = {
        $set: {
            lastSignInTime: lastSignInTime
        }
    }
    const result = await usersCollection.updateOne(filter, updateDoc)
    res.send(result);

})

app.delete('/users/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await usersCollection.deleteOne(query);
    res.send(result);

})


app.get('/', (req, res) => {
    res.send('Coffee server is getting hotter.');
});

run().catch(console.dir);