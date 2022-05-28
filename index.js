const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.krreql1.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized Access' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (error, decoded) {
    if (error) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    req.decoded = decoded;
    next();
  });
}


async function run() {
  try {
    await client.connect();
    const itemsCollection = client.db('jontropati').collection('items');
    const userCollection = client.db('jontropati').collection('user');
    const reviewCollection = client.db('jontropati').collection('reviews');


    app.get('/item', async (req, res) => {
      const query = {};
      const cursor = itemsCollection.find(query);
      const items = await cursor.toArray();
      res.send(items);
    })

    // verify token===================
    app.get('/user', verifyJWT, async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    // ====all users in admin page================
    app.get('/user', async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    })

    // find admin==============
    app.get('/admin/:email', async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user.role === 'admin';
      res.send({ admin: isAdmin });
    })

    // admin====================
    app.put('/user/admin/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;
      const adminRequester = req.decoded.email;

      const requesterAccount = await userCollection.findOne({ email: adminRequester });
      if (requesterAccount.role === 'admin') {
        const filter = { email: email };
        const updateJontro = {
          $set: { role: 'admin' }
        };
        const result = await userCollection.updateOne(filter, updateJontro);

        res.send(result);
      }
      else {
        res.status(403).send({ message: 'forbidden' });
      }

    })


    // user====================
    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateJontro = { $set: user, };
      const result = await userCollection.updateOne(filter, updateJontro, options);

      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({ result, token });
    })

    // reviews =====================
    app.get('/reviews', async (req, res) => {
      const query = {};
      const cursor = reviewsCollection.find(query);
      const items = await cursor.toArray();
      res.send(items);
    })
  }
  finally {

  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`manufacture app listening on port ${port}`)
})