var express = require('express');
var app = express();
var mongo = require('mongodb').MongoClient;
var body_parser = require('body-parser');
var cors = require('cors');
var google_images = require('google-images');

var port = process.env.PORT || 3000;
var google = new google_images(process.env.APPID, process.env.APPKEY );

app.use(express.static('public'));
app.use(cors());
app.use(body_parser.urlencoded({ extended: true })); 
app.use(body_parser.json());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', (req, res)=>{res.sendFile(process.cwd() + '/views/index.html');});

app.get('/api/imgsearch/:keyword', (req, res)=>{
	var image = req.params.keyword;
	var offset = 1;

	mongo.connect(process.env.MONGO_URI, ( err, db )=>db.collection('image_searches').insert({term:image, time: Date()}, (err, data)=>db.close()));

	if(req.query.offset) offset = req.query.offset;

	google.search(image, {page:offset}).then( images=>{
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify(images));
	});	
});


app.get('/api/latest', (req, res)=>{
	res.setHeader('Content-Type', 'application/json');
  
	mongo.connect(process.env.MONGO_URI, ( err, db )=>		
		db.collection('image_searches').find().sort({"time": -1}).limit(10).toArray((err, docs)=>{			
			res.send(JSON.stringify(docs));
			db.close();
		})
	);
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});