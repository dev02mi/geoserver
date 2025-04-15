import React, { useEffect } from "react";
import "./ViewUser.css";


function ViewUser() {
  useEffect(() => {
    // Data retrieved from https://netmarketshare.com
    const generalUserData = [
      { name: 'GU', y: 80 },
      { name: '', y: 30 },
    //   { name: 'Firefox', y: 20 },
    //   { name: 'Safari', y: 10 }
    ];

    const authorizedUserData = [
      { name: 'UU', y: 60 },
      { name: '', y: 20 }
    //   { name: 'Firefox', y: 30 },
    //   { name: 'Safari', y: 20 }
    ];

    drawPieChart("generalUserChart", generalUserData);
    drawPieChart("authorizedUserChart", authorizedUserData);
  }, []);

  function drawPieChart(canvasId, chartData) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");

    const total = chartData.reduce((acc, data) => acc + data.y, 0);
    let startAngle = 0;

    chartData.forEach(data => {
      const sliceAngle = (data.y / total) * 2 * Math.PI;
      const labelAngle = startAngle + sliceAngle / 2;

      const labelX = canvas.width / 2 + Math.cos(labelAngle) * (canvas.height / 3 / 2);
      const labelY = canvas.height / 2 + Math.sin(labelAngle) * (canvas.height / 3 / 2);

      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height / 2);
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.height / 3, startAngle, startAngle + sliceAngle);
      ctx.fillStyle = getRandomColor();
      ctx.fill();

      ctx.fillStyle = "#000";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${data.name}\n${((data.y / total) * 100).toFixed(1)}%`, labelX, labelY);

      startAngle += sliceAngle;
    });
  }

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
        <div className="Chart-Heading">
          <canvas id="generalUserChart" width="200" height="200"></canvas>
          <h3><strong>General User Total</strong></h3>
        </div> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <div className="Chart-Heading">
          <canvas id="authorizedUserChart" width="200" height="200"></canvas>
          <h3><strong>Authorized User Total</strong></h3>
        </div>
      </div>
    </div>
  );
}

export default ViewUser;
