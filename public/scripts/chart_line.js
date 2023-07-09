'use strict';


Chart.register(ChartDataLabels);



const line_data = {
  labels: lineData_tim.map(datapoint => datapoint[0]),
  datasets: [{
    label: 'Tim',
    data: lineData_tim.map(data => data[1].toFixed(0)),
    fill: false,
    borderColor: '#FC4C02',
    backgroundColor: 'rgba(255, 159, 64, 0.2)',
    pointRadius: 0.5,
  },
  {
    label: 'Jack',
    data: lineData_jack.map(data => data[1].toFixed(0)),
    fill: false,
    borderColor: '#3e8ed0',
    backgroundColor: '#eff5fb',
    tension: 0.1,
    pointRadius: 0.5,
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

