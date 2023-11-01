const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5001;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wzxk65v.mongodb.net/?retryWrites=true&w=majority`;

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

    // service collection
    const servicesCollection = client.db("carDoctorDB").collection("services")
    // order collection
    const ordersCollection = client.db("carDoctorDB").collection("orders")

    // get services endpoint
    app.get("/services", async(req, res)=>{
        const cursor = servicesCollection.find()
        const result = await cursor.toArray()
        res.send(result)
    })
    // get a single service
    app.get("/services/:id", async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await servicesCollection.findOne(query)
        res.send(result)
    })

    // get endpoint of orders
    app.get("/orders", async(req, res)=>{
        let query = {};
        if(req.query?.email){
            query = {email: req.query.email}
        }
        const result = await ordersCollection.find(query).toArray()
        res.send(result)
    })

    // post a order by user, POST endpoint
    app.post("/orders", async(req, res)=>{
        const order = req.body;
        const result = await ordersCollection.insertOne(order)
        res.send(result)
    })
      // order, delete endpoint
      app.delete("/orders/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await ordersCollection.deleteOne(query);
        res.send(result);
      });

       // order, patch endpoint
    app.patch("/orders/:id", async(req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updateOrder = req.body
      const updatedDoc = {
          $set: {
              status: updateOrder.status
          }
      }
      const result = await ordersCollection.updateOne(filter, updatedDoc)
      res.send(result)
  })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res) => {
    res.send('doctor is running')
})

app.listen(port,() => {
    console.log(`car Doctor Server is running on port ${port}`)
})