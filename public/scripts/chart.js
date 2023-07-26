'use strict';



const labels = [...users.map(user => user.first_name), 'pacer']


Chart.register(ChartDataLabels);




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
const datapoints = [...users.map(user => (user.mileage / 1609.344).toFixed(1)), pace];

const data = {
  labels,
  datasets: [{
    label: 'YTD mileage',
    data: datapoints,
    barThickness: 20,
    backgroundColor: labels.map(() => 'rgba(255, 159, 64, 0.2)'),
    borderColor: labels.map(() => '#FC4C02'),
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

    for (let i = 0; i < users.length + 1; i++) {
      const img = new Image();
      if (users[i]) {
        img.src = users[i].image;
      } else {
        img.src = 'kippy.png';
      }
      ctx.drawImage(img, x.getPixelForValue(i) - img.width / 2, y.getPixelForValue(datapoints[i]) - img.height / 2, img.width, img.height)
    }
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

