let chart;

document.getElementById("generate").addEventListener("click", () => {
  const type = document.getElementById("type").value;
  const semester = document.getElementById("semester").value;
  const ctx = document.getElementById("chart").getContext("2d");

  // Step 2: Lấy dữ liệu (mô phỏng)
  let labels, data;
  if (type === "tutor") {
    labels = ["Nguyễn Văn A", "Trần Thị B", "Lê Hoàng C"];
    data = [4.8, 4.5, 4.2];
  } else {
    labels = ["Giải tích 1", "Cấu trúc dữ liệu", "Lập trình C++"];
    data = [4.4, 4.1, 4.6];
  }

  // Exception flow: không có dữ liệu
  if (data.length === 0) {
    document.getElementById("errorMsg").textContent = "⚠️ Không có dữ liệu báo cáo!";
    return;
  } else {
    document.getElementById("errorMsg").textContent = "";
  }

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: `Điểm trung bình kỳ ${semester}`,
        data,
        backgroundColor: "#007bff"
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, max: 5, title: { display: true, text: "Điểm (1–5)" } },
        x: { title: { display: true, text: type === "tutor" ? "Tutor" : "Môn học" } }
      }
    }
  });

  const avg = (data.reduce((a,b)=>a+b,0)/data.length).toFixed(2);
  document.getElementById("summary").textContent =
    `📈 Điểm trung bình toàn hệ thống (${semester}): ${avg}/5.0`;
});

// Step 4: Xuất báo cáo
document.getElementById("export").addEventListener("click", () => {
  if (!chart) return;
  const link = document.createElement("a");
  link.download = "report.png";
  link.href = chart.toBase64Image();
  link.click();
});
