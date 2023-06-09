const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER, process.env.DB_PASSWORD);

// -------------connect mongoDB----------------

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.gqju11e.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const chocolateCollection = client.db('chocolateDB').collection('chocolates');

    app.get('/chocolates', async(req, res) =>{
        const cursor = chocolateCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })
    // update operation
    app.get('/chocolates/:id', async(req, res) =>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await chocolateCollection.findOne(query);
        res.send(result);
    })
    app.post('/chocolates', async(req, res) =>{
        const newChocolate = req.body;
        console.log(newChocolate);
        const result = await chocolateCollection.insertOne(newChocolate);
        res.send(result)
    })

    //update
    app.put('/chocolates/:id', async(req, res) =>{
        const id = req.params.id;
        const filter = { _id: new ObjectId(id)}
        const options = { upsert: true };
        const updateChocolate = req.body;
        const chocolate = {
            $set: {
                name: updateChocolate.name,
                photoURL: updateChocolate.photoURL,
                country: updateChocolate.country,
                category: updateChocolate.category,
            }
        }

        const result = await chocolateCollection.updateOne(filter, chocolate, options);
        res.send(result);
    })
    app.delete('/chocolates/:id', async(req, res) =>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await chocolateCollection.deleteOne(query);
        res.send(result);
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) =>{
    res.send("Chocolate management server is running");
})

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})