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

app.get("/results", function (req, res) {

	fs.readFile('pointRecording.json', function (erreur, fichier) {
		var recordings;
		recordings = JSON.parse(fichier);
	
	})
	res.sendFile(__dirname + "/results.html")
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
		res.send(recordings)
	})
  })

app.get('/readData', function (req, res) {
    res.sendFile(__dirname + "/pointRecording.json")
})

app.listen(1337)
