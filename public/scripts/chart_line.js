'use strict';


Chart.register(ChartDataLabels);


const daily_pace = 3000 / 365;

function daysElapsedInYear() {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1); // January 1st of the current year

  const oneDayInMilliseconds = 1000 * 60 * 60 * 24;
  const elapsedMilliseconds = today - startOfYear;

  // Math.ceil is used to account for daylight saving time changes
  const elapsedDays = Math.ceil(elapsedMilliseconds / oneDayInMilliseconds);

  return elapsedDays;
}

let pace_array = Array(daysElapsedInYear() + 1).fill().map((x, i) => (i * daily_pace).toFixed(0));

const line_data = {
  labels: lineData_tim.map(datapoint => datapoint[0]),
  datasets: [{
    label: 'Tim',
    data: lineData_tim.map(data => data[1].toFixed(0)),
    fill: false,
    borderColor: '#ee71c3',
    backgroundColor: '#ee71c3',
    pointRadius: 0.5,
  },
  {
    label: 'Jack',
    data: lineData_jack.map(data => data[1].toFixed(0)),
    fill: false,
    borderColor: '#f29ad8',
    backgroundColor: '#f29ad8',
    tension: 0.1,
    pointRadius: 0.5,
  },
  {
    label: 'Pacer',
    data: pace_array,
    fill: false,
    borderColor: '#AAAAAA',
    backgroundColor: '#DDDDDD',
    tension: 0.1,
    pointRadius: 0,
    borderDash: [10, 5],
    borderWidth: 2,
  }]
};


// config 
const line_config = {
  type: 'line',
  data: line_data,
  options: {
    plugins: {
      datalabels: {
        display: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
      }
    },
    maintainAspectRatio: false,
  }
};

// render init block
const myLineChart = new Chart(
  document.getElementById('lineChart'),
  line_config
);

// Instantly assign Chart.js version
const lineChartVersion = document.getElementById('chartVersion');
lineChartVersion.innerText = Chart.version;

