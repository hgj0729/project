const scriptURL =
  "https://script.google.com/macros/s/AKfycbxrkgknCLUr2w_6f52kNO22yl-S2J9ynOOOV3DP3LpGM9E8YUv74pf8EAo4lz9uD3wr/exec";

const form = document.forms["submit-to-google-sheet"];
const msg = document.getElementById("msg");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  fetch(scriptURL, {
    method: "POST",
    body: new FormData(form),
  })
    .then((response) => {
      msg.innerHTML = "Message sent successfully";

      setTimeout(() => {
        msg.innerHTML = "";
      }, 5000);

      form.reset();
    })
    .catch((error) => {
      console.error("Error!", error.message);
      msg.innerHTML = "전송 중 오류가 발생했습니다.";
    });
});