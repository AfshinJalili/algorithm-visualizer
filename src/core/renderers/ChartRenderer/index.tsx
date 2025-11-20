import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Array1DRenderer } from 'core/renderers';
import styles from './ChartRenderer.module.scss';

interface Element {
  value: unknown;
  selected: boolean;
  patched: boolean;
}

class ChartRenderer extends Array1DRenderer {
  renderData() {
    const {
      data: [row],
    } = this.props.data;

    const chartData = {
      labels: row.map((col: Element) => `${col.value}`),
      datasets: [
        {
          backgroundColor: row.map((col: Element) =>
            col.patched
              ? styles.colorPatched
              : col.selected
                ? styles.colorSelected
                : styles.colorFont
          ),
          data: row.map((col: Element) => col.value),
        },
      ],
    };
    return (
      <Bar
        data={chartData}
        options={{
          scales: {
            y: {
              beginAtZero: true,
            },
          },
          animation: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          responsive: true,
          maintainAspectRatio: false,
        }}
      />
    );
  }
}

export default ChartRenderer;
