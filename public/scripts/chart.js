'use strict';


console.log(users);


let timMiles =  1187.5;
let jackMiles = 1098.9;

var tim_user_id = 15807255;
var jack_user_id = 98327767;
var tim_user = users.find(function (user) {
  return user.user_id === tim_user_id;
});
var jack_user = users.find(function (user) {
  return user.user_id === jack_user_id;
});


if (tim_user) {
  timMiles = (tim_user.mileage/1609).toFixed(1);
}

if (jack_user) {
  jackMiles = (jack_user.mileage/1609).toFixed(1);
}


Chart.register(ChartDataLabels);


// setup 
const img1 = new Image(); 
img1.src = 'tim.png';
const img2 = new Image(); 
img2.src = 'jack.png';
const imgHeight = 76;
const imgWidth = 51;

const datapoints = [timMiles, jackMiles];

const data = {
  labels: ['Tim', 'Jack' ],
  datasets: [{
    label: 'YTD mileage',
    data: datapoints,
    barThickness: 20,
    backgroundColor: [
      'rgba(255, 159, 64, 0.2)',
      'rgba(255, 159, 64, 0.2)'
    ],
    borderColor: [
      '#FC4C02',
      '#FC4C02'
    ],
    borderWidth: 1
  }]
};

// barAvatar Plugin Block

const barAvatar = {
  id: 'barAvatar',
  afterDatasetDraw(chart, args, options) {
    const { ctx, chartArea : { top, bottom, left, right, width, height},
      scales: {x, y} } = chart;
    ctx.save()

    ctx.drawImage(img1, x.getPixelForValue(datapoints[0]) - imgWidth/2, y.getPixelForValue(0) - imgHeight/2, imgWidth, imgHeight)
    ctx.drawImage(img2, x.getPixelForValue(datapoints[1]) - imgWidth/2, y.getPixelForValue(1) - imgHeight/2, imgWidth, imgHeight)
  }
}

// config 
const config = {
  type: 'bar',
  data,
  options: {
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false
      },
      datalabels: { // This code is used to display data values
            anchor: 'end',
            align: 'top',
            offset: 30,
            color: '#FC4C02',
            font: {
                weight: 'bold',
                size: 16
            }
        }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 3000
      }
    }
  },
  plugins: [barAvatar]
};

// render init block
const myChart = new Chart(
  document.getElementById('myChart'),
  config
);

// Instantly assign Chart.js version
const chartVersion = document.getElementById('chartVersion');
chartVersion.innerText = Chart.version;

