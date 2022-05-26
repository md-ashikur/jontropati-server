const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors =require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.krreql1.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
try{
  await client.connect();
  const itemsCollection = client.db('jontropati').collection('items');


  app.get('/item', async(req, res) =>{
    const query = {};
    const cursor = itemsCollection.find(query);
    const items = await cursor.toArray();
    res.send(items);
  })
}
finally{

}
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`manufacture app listening on port ${port}`)
})