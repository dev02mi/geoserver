import React, { useEffect } from "react";
import "./SuDashboard.css";

function SuDashboard() {
  useEffect(() => {
    // Data retrieved from https://netmarketshare.com
    const chartData = [
      { name: 'Admin', y: 70.12 },
      { name: 'UU', y: 20.86 },
      { name: 'GU', y: 32.63 }
    ];

    const canvas = document.getElementById("pieChart");
    const ctx = canvas.getContext("2d");

    const total = chartData.reduce((acc, data) => acc + data.y, 0);
    let startAngle = 0;

    chartData.forEach(data => {
      const sliceAngle = (data.y / total) * 2 * Math.PI;
      const labelAngle = startAngle + sliceAngle / 2;

      // Display label and value inside the circle
      const labelX = canvas.width / 2 + Math.cos(labelAngle) * (canvas.height / 3 / 2);
      const labelY = canvas.height / 2 + Math.sin(labelAngle) * (canvas.height / 3 / 2);

      // Draw pie slice
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height / 2);
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.height / 3, startAngle, startAngle + sliceAngle);
      ctx.fillStyle = getRandomColor();
      ctx.fill();

      // Draw label and value
      ctx.fillStyle = "#000"; // Set text color to black
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${data.name}: ${((data.y / total) * 100).toFixed(1)}%`, labelX, labelY);

      startAngle += sliceAngle;
    });
  }, []);

  // Generate a random color for each slice
  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  return (
    <div className="container">
           
      <div className="row justify-content-center align-items-center m-5">
        <canvas id="pieChart" width="400" height="400"></canvas>
      </div>
        <h2 className="Heading-Name"> Chart</h2>
    </div>
  );
}

export default SuDashboard;
