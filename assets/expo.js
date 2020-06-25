var points = [];
var captureTrue = false;

var counter = 0;
var myInterval = null;

const collisionSVG = "collisionSVG";
var force = [];

var arrayX = new Array();
var arrayY = new Array();

var width = window.innerWidth;
var height = window.innerHeight;

let midHeight = width / 2
let midWidth = height / 2

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
    // averagePoint.x,
    // averagePoint.y,

    if ((averagePoint.x < midWidth) && (averagePoint.y < midHeight)) {
        console.log('hop');
        lookAt(counter, myInterval, 1)
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

/*-----------------------------------------------*/
/*---------------- Page script ------------------*/
/*-----------------------------------------------*/

$(document).ready(function () {
    let calibrationDots = $('.Calibration');
    calibration(calibrationDots);
});

function calibration(calibrationDots) {
    let clickCount = 0;
    calibrationDots.on('click', function () {
        clickCount++;
        $(this).css('opacity', '0')
        if (clickCount == 9) {

            $('.calibrationDiv').addClass('close');

        }
    })
}

function lookAt(counter, myInterval, id) {
    console.log([counter, myInterval, id]);

    let target = $('#tile'+id);

    let number = target.find('.res'); 

    // TODO number ++
    
    // $(".target").hover(function (e) {
    //     myInterval = setInterval(function () {
    //         var data = $(e.target).data('type')
    //         var target = $("span.number." + data)
    //         target.text((parseInt(target.text()) + 1));
    //     }, 1);
    // })

    // setInterval(function () {
    //     var max = 0;
    //     var project = "";
    //     $.each($("span.number"), function (key, value) {
    //         console.info(value)
    //         console.log(parseInt(value.textContent))
    //         console.log(value.dataset.project)
    //         if (parseInt(value.textContent) > max) {
    //             max = parseInt(value.textContent)
    //             project = value.dataset.project
    //         }
    //     })
    //     // document.location.href = "./results.php?ProjetName=" + project + "&Time=" + max;
    // }, 10000)
}