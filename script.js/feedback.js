const form = document.getElementById("feedbackForm");
const list = document.getElementById("feedbackList");
const message = document.getElementById("message");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const session = document.getElementById("session").value;
  const rating = parseInt(document.getElementById("rating").value);
  const comment = document.getElementById("comment").value.trim();

  if (comment.length > 500) {
    message.textContent = "⚠️ Nhận xét vượt quá 500 ký tự!";
    message.style.color = "red";
    return;
  }

  if (!comment) {
    message.textContent = "⚠️ Vui lòng nhập nhận xét!";
    message.style.color = "red";
    return;
  }

  const feedback = {
    session,
    rating,
    comment,
    date: new Date().toLocaleString()
  };

  const data = JSON.parse(localStorage.getItem("feedbackData")) || [];
  data.push(feedback);
  localStorage.setItem("feedbackData", JSON.stringify(data));

  message.textContent = " Đánh giá đã được gửi thành công!";
  message.style.color = "green";
  form.reset();
  renderList();
});

function renderList() {
  const data = JSON.parse(localStorage.getItem("feedbackData")) || [];
  list.innerHTML = data.map(f => `
    <li>
      <b>${f.session}</b> (${f.date})<br>
      ⭐ ${f.rating}/5<br>
      <i>${f.comment}</i>
    </li>
  `).join("");
}
renderList();


