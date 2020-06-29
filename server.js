const express = require("express");
const fs = require('fs');
const path = require('path');
const app = express();
var array = [];

app.use(express.json());

var index = 1;

app.use("/dist", express.static(__dirname + "/dist"))
app.use("/css", express.static(__dirname + "/css"))
app.use("/assets", express.static(__dirname + "/assets"))

app.get("/", function (req, res) {
	res.sendFile(__dirname + "/index.html")
})

app.get('/video', function(req, res) {
	const path = 'assets/medias/video.mp4'
	const stat = fs.statSync(path)
	const fileSize = stat.size
	const range = req.headers.range
  
	if (range) {
	  const parts = range.replace(/bytes=/, "").split("-")
	  const start = parseInt(parts[0], 10)
	  const end = parts[1]
		? parseInt(parts[1], 10)
		: fileSize-1
  
	  if(start >= fileSize) {
		res.status(416).send('Requested range not satisfiable\n'+start+' >= '+fileSize);
		return
	  }
	  
	  const chunksize = (end-start)+1
	  const file = fs.createReadStream(path, {start, end})
	  const head = {
		'Content-Range': `bytes ${start}-${end}/${fileSize}`,
		'Accept-Ranges': 'bytes',
		'Content-Length': chunksize,
		'Content-Type': 'video/mp4',
	  }
  
	  res.writeHead(206, head)
	  file.pipe(res)
	} else {
	  const head = {
		'Content-Length': fileSize,
		'Content-Type': 'video/mp4',
	  }
	  res.writeHead(200, head)
	  fs.createReadStream(path).pipe(res)
	}
  })

app.get("/adds", function (req, res) {
	res.sendFile(__dirname + "/adds.html")
})
app.get("/expo", function (req, res) {
	res.sendFile(__dirname + "/expo.html")
})

app.get("/addsRules", function (req, res) {
	res.sendFile(__dirname + "/addsRules.html")
})
app.get("/expoRules", function (req, res) {
	res.sendFile(__dirname + "/expoRules.html")
})


app.use('/expoResults', express.static(__dirname + '/expoResults.html'));

app.set('view engine', 'html');
app.set('views', __dirname + '/');


app.get("/results", function (req, res) {

	fs.readFile('pointRecording.json', function (erreur, fichier) {
		var recordings;
		recordings = JSON.parse(fichier);
	})
	res.sendFile(__dirname + "/results.html")
})

app.get('/json', function(req, res) {

	fs.readFile('pointRecording.json', function (erreur, fichier) {
		var recordings;
		recordings = JSON.parse(fichier);
		return recordings
	})
})

//Recording Json file for heatmap
app.post('/data', function (req, res) {
	array.push(req.body);
	fs.writeFile('pointRecording.json', JSON.stringify(array), (err) => {
		if (err) throw err;
		index++;
	});
});

app.post('/deleteData', function (req, res) {
	fs.writeFile('pointRecording.json', '', (err) => {
        if (err) throw err;
        console.log('Delete Data');
	});
	array = [];
});

app.get('/recordingJson', function (req, res) {
	var recordings;
	fs.readFile('pointRecording.json', function (erreur, fichier) {
		recordings = JSON.parse(fichier);
		res.send(recordings)
	})
  })

app.get('/readData', function (req, res) {
    res.sendFile(__dirname + "/pointRecording.json")
})

app.listen(1337)
