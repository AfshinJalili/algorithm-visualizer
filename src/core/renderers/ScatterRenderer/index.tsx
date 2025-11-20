import React from 'react';
import { Scatter } from 'react-chartjs-2';
import Array2DRenderer from '../Array2DRenderer';

const convertToObjectArray = ([x, y]: [number, number]) => ({ x, y });
const colors = ['white', 'green', 'blue', 'red', 'yellow', 'cyan'];

interface Element {
  value: [number, number];
  selected: boolean;
  patched: boolean;
}

class ScatterRenderer extends Array2DRenderer {
  renderData() {
    const { data } = this.props.data;

    const datasets = data.map((series: Element[], index: number) => ({
      backgroundColor: colors[index],
      data: series.map(s => convertToObjectArray(s.value)),
      label: Math.random(),
      radius: (index + 1) * 2,
    }));

    const chartData = {
      datasets,
    };

    return (
      <Scatter
        data={chartData}
        options={{
          plugins: {
            legend: {
              display: false,
            },
          },
          animation: false,
          layout: {
            padding: {
              left: 20,
              right: 20,
              top: 20,
              bottom: 20,
            },
          },
          scales: {
            y: {
              beginAtZero: false,
            },
            x: {
              beginAtZero: false,
            },
          },
        }}
      />
    );
  }
}

export default ScatterRenderer;
