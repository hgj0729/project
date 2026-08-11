const scriptURL =

"https://script.google.com/macros/s/AKfycbyp5kzgnvw9SLqXrREaM_VU6re9YRnoDpoNRMnewNMaOk1xi2AbLvxrb7MoYO5gwnld/exec"; // 자신의 app스크립트 주소 링크 넣는 위치

const form = document.forms["submit-to-google-sheet"];

const msg = document.getElementById("msg");

​

form.addEventListener("submit", (e) => {

e.preventDefault();

fetch(scriptURL, { method: "POST", body: new FormData(form) })

.then((response) => {

msg.innerHTML = "Message sent successfully";

setTimeout(function () {

msg.innerHTML = "";

}, 5000);

form.reset();

})

.catch((error) => console.error("Error!", error.message));

});