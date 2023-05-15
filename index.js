const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dc2rluc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		// Connect the client to the server
		await client.connect();

		const productCollection = client.db('ema-john-db').collection('products');

		// get data from db
		app.get('/products', async (req, res) => {
			console.log(req.query);

			const page = parseInt(req.query.page) || 0;
			const limit = parseInt(req.query.limit) || 10;
			const skip = page * limit;

			const result = await productCollection
				.find()
				.skip(skip)
				.limit(limit)
				.toArray();
			res.send(result);
		});

		app.get('/totalProducts', async (req, res) => {
			const result = await productCollection.estimatedDocumentCount();
			res.send({ totalProducts: result });
		});

		app.post('/productsById', async (req, res) => {
			const ids = req.body;
			const objectIds = ids.map((id) => new ObjectId(id));
			const query = { _id: { $in: objectIds } };
			const result = await productCollection.find(query).toArray();
			res.send(result);
		});

		// Send a ping to confirm
		await client.db('admin').command({ ping: 1 });
		console.log(
			'Pinged your deployment. You successfully connected to MongoDB!'
		);
	} finally {
		// client will close when you finish/error
		// await client.close();
	}
}
run().catch(console.dir);

app.get('/', (req, res) => {
	res.send('Ema John server is running');
});

app.listen(port, () => {
	console.log('Ema John server is running on port:', port);
});
