"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Legend,
  Tooltip,
} from "chart.js";

// BELANGRIJK: registreer ook LineController
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Legend,
  Tooltip
);

export default function Grafiek() {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // voorkom Canvas-in-use fout
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");

    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Start"],
        datasets: [
          {
            label: "Sensorwaarde",
            data: [130],
            borderColor: "blue",
            borderWidth: 3,
          },
          {
            label: "Ideale waarde (130)",
            data: [130],
            borderColor: "green",
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: false,
        animation: false,
        scales: {
          y: {
            min: 0,
            max: 250,
          },
        },
      },
    });

    chartInstanceRef.current = chart;

    return () => {
      chart.destroy();
    };
  }, []);

  useEffect(() => {
    const chart = chartInstanceRef.current;
    if (!chart) return;

    const interval = setInterval(() => {
      const change = Math.floor(Math.random() * 11) + 10;
      const dir = Math.random() > 0.5 ? 1 : -1;

      const last = chart.data.datasets[0].data.at(-1);
      let newValue = last + dir * change;

      newValue = Math.max(0, Math.min(250, newValue));

      chart.data.labels.push("update");
      chart.data.datasets[0].data.push(newValue);
      chart.data.datasets[1].data.push(130);

      chart.update();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>Live GraphJS Grafiek</h2>
      <canvas ref={chartRef} height="300" />
    </div>
  );
}
