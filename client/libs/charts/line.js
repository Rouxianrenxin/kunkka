var easing = require('./easing');
var autoscale = require('./autoscale');
var utils = require('./utils');

class LineChart {
  constructor(container) {
    this.container = container;
    this.initDOM();
  }

  initDOM() {
    var canvas = this.canvas = document.createElement('canvas'),
      bCanvas = this.bCanvas = document.createElement('canvas');

    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    this.container.appendChild(bCanvas);
    this.container.appendChild(canvas);

    autoscale([canvas, bCanvas], {
      width: this.width,
      height: this.height
    });
  }

  setOption(option) {
    this.option = option;
    this.ticks = Math.round(option.period / 16);
    this.count = 0;
    this.easingFunc = easing[option.easing || 'linear'];

    // Calc Axis
    this.calcAxis(option);

    // Calc positions
    this.calcPostions(option);

    // Render background
    this.renderLineBackground(option);

    // Render Line
    this.canvas.getContext('2d').translate(0.5, -0.5);
    this.renderLine(option);
  }

  calcAxis(option) {
    var tickPeriod = this.tickPeriod = option.yAxis.tickPeriod || 10;

    // // calc the width of y-text
    // var ctx = this.canvas.getContext('2d');
    // this.marginLeft = ctx.measureText('' + realMax).width;

    var max, min, data = [],
      realMax, realMin;
    option.series.forEach(function(m) {
      data = data.concat(m.data);
    });
    max = Math.max.apply(null, data);
    realMax = this.realMax = Math.ceil(max * 1.2 / tickPeriod) * tickPeriod;

    min = Math.min.apply(null, data);
    if (min >= 0) {
      realMin = this.realMin = 0;
    } else {
      realMin = this.realMin = Math.floor(min * 1.2 / tickPeriod) * tickPeriod;
    }

    this.marginLeft = 20;
    this.marginBottom = 20;

    this.ratioY = (this.height - this.marginBottom) / (realMax - realMin);
    // console.log(this.height-this.marginBottom,this.ratioY)
    // console.log(max, realMax, min, realMin);

    var xData = option.xAxis.data;
    this.interval = Math.ceil(xData.length / 6);
    this.ratioX = (this.width - this.marginLeft) / (xData.length - 1);
    // console.log(interval, this.ratioX);
  }

  renderLineBackground(option) {
    var ctx = this.bCanvas.getContext('2d'),
      yAxis = option.yAxis,
      marginLeft = this.marginLeft,
      marginBottom = this.marginBottom,
      height = this.height,
      width = this.width,
      xData = option.xAxis.data;

    ctx.translate(0.5, -0.5);
    ctx.strokeStyle = yAxis.color;
    ctx.fillStyle = yAxis.tickColor;
    ctx.lineWidth = 1;

    // Draw yAxis
    ctx.beginPath();
    ctx.moveTo(marginLeft, 0);
    ctx.lineTo(marginLeft, height - marginBottom);
    ctx.stroke();

    // Draw xAxis
    ctx.beginPath();

    var t = height - marginBottom - this.ratioY * this.tickPeriod * (-this.realMin) / this.tickPeriod;
    ctx.moveTo(marginLeft, t);
    ctx.lineTo(width, t);
    ctx.stroke();

    // draw yAxis
    ctx.textAlign = 'right';
    //console.log((this.realMax-this.realMin) / this.tickPeriod)
    for (let i = 0, len = (this.realMax - this.realMin) / this.tickPeriod; i < len; i++) {
      let y = height - this.ratioY * this.tickPeriod * i;
      ctx.beginPath();
      ctx.moveTo(marginLeft, y - marginBottom);
      ctx.lineTo(marginLeft - 3, y - marginBottom);
      ctx.stroke();
      ctx.fillText(this.tickPeriod * i + this.realMin, this.marginLeft - 5, y - marginBottom + 3);
    }

    // draw xAxis
    ctx.textAlign = 'center';
    for (let i = 1, len = Math.ceil(xData.length / this.interval); i < len; i++) {
      let x = marginLeft + i * this.ratioX * this.interval;
      ctx.beginPath();
      ctx.moveTo(x, t);
      ctx.lineTo(x, t + 3);
      ctx.stroke();
      ctx.fillText(xData[i * this.interval], x, t + 15);
    }

    // draw title
    ctx.textAlign = 'left';
    ctx.font = '13px "Helvetica Neue"';
    ctx.fillText(option.title, this.marginLeft + 20, 20);
  }

  // Calc the data points and the control-points
  calcPostions(option) {
    var series = option.series,
      ratioX = this.ratioX,
      ratioY = this.ratioY,
      height = this.height,
      marginLeft = this.marginLeft,
      marginBottom = this.marginBottom,
      realMin = this.realMin;

    this.positions = [];
    this.ctPositions = [];

    series.forEach((s, i) => {
      var p = this.positions[i] = [];
      var cp = this.ctPositions[i] = [];
      var len = s.data.length;

      s.data.forEach((data, j) => {
        p.push({
          x: marginLeft + j * ratioX,
          y: height - marginBottom - ratioY * (data - realMin)
        });
      });

      s.data.forEach((data, j) => {
        // calc control point for bezierCurveTo func
        if (j === 0) {
          cp.push({
            x: (p[0].x + p[1].x) / 2,
            y: (p[0].y + p[1].y) / 2
          });
        } else if (j === (len - 1)) {
          cp.push({
            x: (p[j].x + p[j - 1].x) / 2,
            y: (p[j].y + p[j - 1].y) / 2
          });
        } else {
          let middle = {
            x: (p[j - 1].x + p[j + 1].x) / 2,
            y: (p[j - 1].y + p[j + 1].y) / 2
          };

          var diffY = p[j].y - middle.y;

          var pre = {
            x: (p[j - 1].x + middle.x) / 2,
            y: (p[j - 1].y + middle.y) / 2 + diffY
          };

          var post = {
            x: (p[j + 1].x + middle.x) / 2,
            y: (p[j + 1].y + middle.y) / 2 + diffY
          };
          cp.push(pre, post);
        }
      });
    });


  }

  renderLine(option) {
    var ctx = this.canvas.getContext('2d'),
      series = option.series,
      height = this.height,
      marginLeft = this.marginLeft,
      marginBottom = this.marginBottom,
      ratioX = this.ratioX,
      ratioY = this.ratioY,
      realMin = this.realMin,
      zeroY = height - marginBottom + ratioY * realMin,
      positions = this.positions,
      ctPositions = this.ctPositions;

    //console.log(ctPositions);

    series.forEach((s, j) => {
      var data = s.data,
        color = s.color,
        type = s.type,
        opacity = s.opacity,
        position = positions[j],
        ctPosition = ctPositions[j];

      // draw area
      ctx.beginPath();
      ctx.fillStyle = utils.toRGB(color, opacity);
      ctx.moveTo(marginLeft, zeroY);
      data.forEach((m, i) => {
        if (i === 0) {
          ctx.lineTo(position[i].x, position[i].y);
        } else {
          // ctx.lineTo(position[i].x, position[i].y);
          if (type === 'sharp') { //curve, sharp, curve by default
            ctx.lineTo(position[i].x, position[i].y);
          } else {
            ctx.bezierCurveTo(ctPosition[i * 2 - 2].x, ctPosition[i * 2 - 2].y,
              ctPosition[i * 2 - 1].x, ctPosition[i * 2 - 1].y,
              position[i].x, position[i].y);
          }

        }
      });
      ctx.lineTo(marginLeft + (data.length - 1) * ratioX, zeroY);
      ctx.fill();

      // draw outline
      ctx.beginPath();
      ctx.strokeStyle = color;
      data.forEach((m, i) => {
        if (i === 0) {
          ctx.lineTo(position[i].x, position[i].y);
        } else {
          if (type === 'sharp') { //curve, sharp, curve by default
            ctx.lineTo(position[i].x, position[i].y);
          } else {
            ctx.bezierCurveTo(ctPosition[i * 2 - 2].x, ctPosition[i * 2 - 2].y,
              ctPosition[i * 2 - 1].x, ctPosition[i * 2 - 1].y,
              position[i].x, position[i].y);
          }

        }
      });
      ctx.lineTo(marginLeft + (data.length - 1) * ratioX, zeroY);
      ctx.stroke();
    });

    if (this.count === this.ticks) {
      this.count = 0;
      return;
    }
    //this.animationId = requestAnimationFrame(this.renderLine.bind(this));
  }

}

module.exports = LineChart;
