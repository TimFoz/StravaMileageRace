'use strict';


console.log(users);


let timMiles = 0;
let jackMiles = 0;

var tim_user_id = 15807255;
var jack_user_id = 98327767;
var tim_user = users.find(function (user) {
  return user.user_id === tim_user_id;
});
var jack_user = users.find(function (user) {
  return user.user_id === jack_user_id;
});


if (tim_user) {
  timMiles = (tim_user.mileage / 1609).toFixed(1);
}

if (jack_user) {
  jackMiles = (jack_user.mileage / 1609).toFixed(1);
}


Chart.register(ChartDataLabels);


// setup 
const img1 = new Image();
img1.src = 'tim.png';
const img2 = new Image();
img2.src = 'jack.png';
const img3 = new Image();
img3.src = 'kippy.png';
const img1Height = 76;
const img1Width = 51;
const img2Height = 76;
const img2Width = 51;
const img3Height = 76;
const img3Width = 61;



const getDaysRatio = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const elapsedMilliseconds = currentDate - startOfYear;
  const totalMilliseconds = new Date(currentYear + 1, 0, 1) - startOfYear;
  const ratio = elapsedMilliseconds / totalMilliseconds;
  return ratio;
};
const pace = (3000 * getDaysRatio()).toFixed(1);
const datapoints = [timMiles, jackMiles, pace];

const data = {
  labels: ['Tim', 'Jack', 'pacer'],
  datasets: [{
    label: 'YTD mileage',
    data: datapoints,
    barThickness: 20,
    backgroundColor: [
      'rgba(255, 159, 64, 0.2)',
      'rgba(255, 159, 64, 0.2)',
      'rgba(255, 159, 64, 0.2)'
    ],
    borderColor: [
      '#FC4C02',
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
    const { ctx, chartArea: { top, bottom, left, right, width, height },
      scales: { x, y } } = chart;
    ctx.save()

    ctx.drawImage(img1, x.getPixelForValue(0) - img1Width / 2, y.getPixelForValue(datapoints[0]) - img1Height / 2, img1Width, img1Height)
    ctx.drawImage(img2, x.getPixelForValue(1) - img2Width / 2, y.getPixelForValue(datapoints[1]) - img2Height / 2, img2Width, img2Height)
    ctx.drawImage(img3, x.getPixelForValue(2) - img3Width / 2, y.getPixelForValue(datapoints[2]) - img3Height / 2, img3Width, img3Height)
  }
}

// config 
const config = {
  type: 'bar',
  data,
  options: {
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
      y: {
        beginAtZero: true,
        max: 3000
      }
    },
    maintainAspectRatio: false,
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

