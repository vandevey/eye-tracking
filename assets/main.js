var points = [];
var captureTrue = false;

var images = [
  "//images.unsplash.com/photo-1592727995117-4cdc7ee6fcb4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80",
  "//images.unsplash.com/photo-1592799874167-413e2013445e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80",
  "//images.unsplash.com/photo-1592762331869-d7c8eaa63f58?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80",
  "//images.unsplash.com/photo-1592761945110-33520eabf327?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80"
]

const collisionSVG = "collisionSVG";
var force = [];

var arrayX = new Array();
var arrayY = new Array();

window.onload = function () {

  var localstorageLabel = 'webgazerGlobalData';
  window.localStorage.setItem(localstorageLabel, null);

  webgazer.setRegression('ridge') /* currently must set regression and tracker */
    .setTracker('clmtrackr')
    .begin()
    .showPredictionPoints(false); /* shows a square every 100 milliseconds where current prediction is */

  function checkIfReady() {
    var feedbackBox = document.getElementById(webgazer.params.faceFeedbackBoxId);

    if (!webgazer.isReady()) {
      setTimeout(checkIfReady, 100);
    }
    // This isn't strictly necessary, but it makes the DOM easier to read
    // to have the z draw order reflect the DOM order.
    else if (typeof (feedbackBox) == 'undefined' || feedbackBox == null) {
      setTimeout(checkIfReady, 100);
    }
    else {
      // Add the SVG component on the top of everything.
      setupCollisionSystem();
      webgazer.setGazeListener(collisionEyeListener);
    }
  }
  setTimeout(checkIfReady, 100);
};

function setupCollisionSystem() {
  var width = window.innerWidth;
  var height = window.innerHeight;

  var numberOfNodes = 200;

  nodes = d3.range(numberOfNodes).map(function () { return { radius: Math.random() * 12 + 4 }; }),
    nodes[0].radius = 0;
  nodes[0].fixed = true;

  force = d3.layout.force()
    .gravity(0.05)
    .charge(function (d, i) { return i ? 0 : -2000; })
    .nodes(nodes)
    .size([width, height])
    .start();

  var svg = d3.select("body").append("svg")
    .attr("id", collisionSVG)
    .attr("width", width)
    .attr("height", height)
    .style("top", "0px")
    .style("left", "0px")
    .style("margin", "0px")
    .style("position", "absolute")
    .style("z-index", 110);

  svg.append("line")
    .attr("id", "eyeline1")
    .attr("stroke-width", 2)
    .attr("stroke", "green");

  svg.append("line")
    .attr("id", "eyeline2")
    .attr("stroke-width", 2)
    .attr("stroke", "green");

  svg.append("rect")
    .attr("id", "averageCircle")
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", "green");
}

var collisionEyeListener = function (data, clock) {
  if (!data)
    return;

  var cl = webgazer.getTracker().clm;
  var whr = webgazer.getVideoPreviewToCameraResolutionRatio();

  var dot = d3.select("#predictionSquare")
    .attr("x", data.x)
    .attr("y", data.y);

  function arraySlice(array) {
    if (array.length >= 10) {
      array.splice(9);
    }
  }

  function pointsAverage(x, y) {
    arrayX.unshift(x);
    arrayY.unshift(y);
    arraySlice(arrayX);
    arraySlice(arrayY);
    var average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;
    var averageX = average(arrayX);
    var averageY = average(arrayY);

    return {
      'x': averageX,
      'y': averageY
    };
  }

  averagePoint = pointsAverage(data.x, data.y);

  var point = {
    x: averagePoint.x,
    y: averagePoint.y,
    value: 100,
    // radius configuration on point basis
    radius: 100
  };

  if (captureTrue) {
    points.push(point);
  }

  var dot2 = d3.select("#averageCircle")
    .attr("x", averagePoint.x)
    .attr("y", averagePoint.y)

  var line = d3.select('#eyeline1')
    .attr("x1", averagePoint.x)
    .attr("y1", averagePoint.y)
    .attr("x2", cl.getCurrentPosition()[27][0] * whr[0])
    .attr("y2", cl.getCurrentPosition()[27][1] * whr[1]);

  var line = d3.select("#eyeline2")
    .attr("x1", averagePoint.x)
    .attr("y1", averagePoint.y)
    .attr("x2", cl.getCurrentPosition()[32][0] * whr[0])
    .attr("y2", cl.getCurrentPosition()[32][1] * whr[1]);

  nodes[0].px = averagePoint.x;
  nodes[0].py = averagePoint.y;
  force.resume();
}

let calibrationDots = $('.Calibration');

let clickCount = 0;
calibrationDots.on('click', function () {
  clickCount++;
  $(this).css('opacity', '0')
  if (clickCount == 9) {
    let index = 0;
    screen(index);
  }
})


function screen(index) {
  // code
  console.log(index);
  if (index < 1) {
    $('.calibrationDiv').addClass('close');
  }
  if (index < images.length) {
   
    $('#image-' + index).addClass('visible');

    setTimeout(() => {
      console.log('start');
      captureTrue = true;
      $('.ProgressBar').addClass('active');
    }, 1000);

    setTimeout(() => {
      console.log('fin capture' + index);

      var json = JSON.stringify(points);
      postAjax(json);

      captureTrue = false;
      points = [];
      $('#image-' + index).removeClass('visible');
      index++;
      screen(index) //again
    }, 11000);
  } else {
    console.log('redirect');
    document.location.href = "http://localhost:1337/results";


  }
}

$(document).ready(function () {
  $.each(images, function (index, image) {
    $('#image-' + index).attr('src', image);
  });
})

function postAjax(json) {
  $.ajax({
    url: "/data",
    type: "POST",
    data: json,
    dataType: "json",
    contentType: "application/json; charset=utf-8",
    success: function (data) {
      console.log("data: " + data);
    }
  })
}
