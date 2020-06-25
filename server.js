const express = require("express");
const fs = require('fs');

const app = express()
app.use(express.json())
var array = [];
var index = 1;

app.use("/dist", express.static(__dirname + "/dist"))
app.use("/css", express.static(__dirname + "/css"))
app.use("/assets", express.static(__dirname + "/assets"))

app.get("/", function (req, res) {
	res.sendFile(__dirname + "/index.html")
})

app.get("/adds", function (req, res) {
	res.sendFile(__dirname + "/adds.html")
})
app.get("/expo", function (req, res) {
	res.sendFile(__dirname + "/expo.html")
})

// This is where all the magic happens!
app.engine('html', swig.renderFile);

app.set('view engine', 'html');
app.set('views', __dirname + '/');

// Swig will cache templates for you, but you can disable
// that and use Express's caching instead, if you like:
app.set('view cache', false);
// To disable Swig's cache, do the following:
swig.setDefaults({ cache: false });
// NOTE: You should always cache templates in a production environment.
// Don't leave both of these to `false` in production!

app.get("/results", function (req, res) {

	fs.readFile('pointRecording.json', function (erreur, fichier) {
		var recordings;
		recordings = JSON.parse(fichier);
		console.log("recording: " + recordings);
		console.log("table0: " + recordings.table0);
	})
	res.sendFile(__dirname + "/results.html")
})

app.get('/json', function(req, res) {
	
	fs.readFile('pointRecording.json', function (erreur, fichier) {
		var recordings;
		recordings = JSON.parse(fichier);
		console.log("recording: " + recordings);
		console.log("table0: " + recordings.table0);

		return recordings
	})
})

//Recording Json file for heatmap
app.post('/data', function (req, res) {
	array.push(req.body);
	fs.writeFile('pointRecording.json', JSON.stringify(array), (err) => {
		if (err) throw err;
		index++;
		console.log('Data written to file');
	});
});

app.post('/deleteData', function (req, res) {
	console.log('Delete Data');
	fs.unlinkSync('pointRecording.json');
});

app.get('/recordingJson', function (req, res) {
	var recordings;
	fs.readFile('pointRecording.json', function (erreur, fichier) {
		recordings = JSON.parse(fichier);
		//Table 0 , 1, 2, 3
		//console.log(recordings[0]);
		res.send(recordings)
	})
	
  })

app.get('/readData', function (req, res) {
    res.sendFile(__dirname + "/pointRecording.json")
})

app.listen(1337)
