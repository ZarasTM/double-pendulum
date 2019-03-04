var canvas;
var canvasTrail;
var ctx;
var ctxTrail;

var myPendulum;

var g = 0.5;
var damp = 1;

var massSlider1;
var massSlider2;
var dampSlider;
var armSlider1;
var armSlider2;

var prevLoc = 0;

class doublePendulum
{
    constructor(len1, len2)
    {
        this.ang = [Math.PI/2, Math.PI/2];
        this.vel = [0, 0];
        this.acc = [0, 0];
        this.len = [len1, len2];

        this.joints = [
            new joint(new point2(0, 0), 0),
            new joint(new point2(0, 0), 1),
            new joint(new point2(0, 0), 1)
        ];

        this.recalculate();
    }

    recalculate()
    {
        this.joints[1].location.x = this.len[0]*Math.sin(this.ang[0]);
        this.joints[1].location.y = this.len[0]*Math.cos(this.ang[0]);

        this.joints[2].location.x = this.joints[1].location.x + this.len[1]*Math.sin(this.ang[1]);
        this.joints[2].location.y = this.joints[1].location.y + this.len[1]*Math.cos(this.ang[1]);
    }

    render()
    {
        ctx.beginPath();
        ctx.moveTo(this.joints[0].location.x, this.joints[0].location.y);
        ctx.lineTo(this.joints[1].location.x, this.joints[1].location.y);
        ctx.lineTo(this.joints[2].location.x, this.joints[2].location.y);
        ctx.stroke();

        this.joints[0].render();
        this.joints[1].render();
        this.joints[2].render();
    }
}

class joint
{
    constructor(loc, mass)
    {
        this.location = loc;
        this.mass = mass;
        this.r = 10;
    }

    render()
    {
        ctx.beginPath();
        ctx.moveTo(this.location.x+this.r, this.location.y);
        ctx.arc(this.location.x, this.location.y, this.r, 0, 2*Math.PI);
        ctx.stroke();
    }
}

class point2
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }
}

function main()
{
    console.log("Running main");

    // Initializing canvas and getting 2d context
    canvas = document.getElementById("main_canvas");
    ctx = canvas.getContext("2d");

    canvasTrail = document.getElementById("trail_canvas");
    ctxTrail = canvasTrail.getContext("2d");

    if(!ctx)
    {
        console.log("Your browser does not support this context");
    }

    massSlider1 = document.getElementById("massSlid1");
    massSlider2 = document.getElementById("massSlid2");
    dampSlider = document.getElementById("dampSlid");
    armSlider1 = document.getElementById("armSlid1");
    armSlider2 = document.getElementById("armSlid2");


    // Set new 0,0 point to beginning of pendulum
    ctx.translate(canvas.width/2, canvas.height/2);
    ctxTrail.translate(canvas.width/2, canvas.height/2);

    // Init style and pendulum itself
    initStyle();
    initPendulum();

    requestAnimationFrame(nextFrame);
}

function nextFrame()
{
    updateValues();

    var top1 = -g * (2 * myPendulum.joints[1].mass + myPendulum.joints[2].mass) * Math.sin(myPendulum.ang[0]);
    var top2 = -myPendulum.joints[2].mass * g * Math.sin(myPendulum.ang[0] - 2 * myPendulum.ang[1]);
    var top3 = -2 * Math.sin(myPendulum.ang[0] - myPendulum.ang[1]) * myPendulum.joints[2].mass;
    var top4 = myPendulum.vel[1] * myPendulum.vel[1] * myPendulum.len[1] + myPendulum.vel[0] * myPendulum.vel[0] * myPendulum.len[0] * Math.cos(myPendulum.ang[0] - myPendulum.ang[1]);
    var bot = myPendulum.len[0] * (2*myPendulum.joints[1].mass + myPendulum.joints[2].mass - myPendulum.joints[2].mass * Math.cos(2 * myPendulum.ang[0] - 2 * myPendulum.ang[1]));

    myPendulum.acc[0] = (top1 + top2 + (top3 * top4)) / bot;

    top1 = 2 * Math.sin(myPendulum.ang[0] - myPendulum.ang[1]);
    top2 = myPendulum.vel[0] * myPendulum.vel[0] * myPendulum.len[0] * (myPendulum.joints[1].mass + myPendulum.joints[2].mass);
    top3 = g * (myPendulum.joints[1].mass + myPendulum.joints[2].mass) * Math.cos(myPendulum.ang[0]);
    top4 = myPendulum.vel[1] * myPendulum.vel[1] * myPendulum.len[1] * myPendulum.joints[2].mass * Math.cos(myPendulum.ang[0] - myPendulum.ang[1]);
    bot = myPendulum.len[1] * (2 * myPendulum.joints[1].mass + myPendulum.joints[2].mass - myPendulum.joints[2].mass * Math.cos(2 * myPendulum.ang[0] - 2 * myPendulum.ang[1]));

    myPendulum.acc[1] = (top1 * (top2 + top3 + top4)) / bot;

    myPendulum.vel[0] = myPendulum.vel[0] + myPendulum.acc[0];
    myPendulum.vel[1] = myPendulum.vel[1] + myPendulum.acc[1];

    myPendulum.ang[0] = myPendulum.ang[0] + myPendulum.vel[0];
    myPendulum.ang[1] = myPendulum.ang[1] + myPendulum.vel[1];

    myPendulum.vel[0] *= damp;
    myPendulum.vel[1] *= damp;

    clear();
    myPendulum.recalculate();
    myPendulum.render();

    if(prevLoc != 0)
    {
        ctxTrail.lineTo(myPendulum.joints[2].location.x, myPendulum.joints[2].location.y);
        ctxTrail.stroke();
    }

    prevLoc = myPendulum.joints[2].location;

    requestAnimationFrame(nextFrame);
}

function updateValues()
{
    myPendulum.joints[1].mass = massSlider1.value/10;
    myPendulum.joints[2].mass = massSlider2.value/10;

    if(dampSlider.value == 1000)
    {
        damp = 1;
    }
    else
    {
        damp = 1 - (1 / dampSlider.value);
    }

    myPendulum.len[0] = armSlider1.value;
    myPendulum.len[1] = armSlider2.value;

}


function clear()
{
    ctx.clearRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
}

function initStyle()
{
    ctx.strokeStyle = "#0F0";
    ctx.lineWidth = 2;
    ctxTrail.strokeStyle = "#030";
    ctxTrail.lineWidth = 1;
}

function initPendulum()
{
    myPendulum = new doublePendulum(canvas.height/4-50, canvas.width/4-50);
}