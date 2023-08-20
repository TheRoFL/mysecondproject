document.querySelector(".login").addEventListener("click", () => {
  document.querySelector(".login_window").classList.remove("hidden");
  document.querySelector(".login_overflow").classList.remove("hidden");
});

document.addEventListener("keydown", (e) => {
  if (e.code == "Escape") {
    document.querySelector(".login_window").classList.add("hidden");
    document.querySelector(".login_overflow").classList.add("hidden");
  }
});

document.querySelector(".login_overflow").addEventListener("click", () => {
  document.querySelector(".login_window").classList.add("hidden");
  document.querySelector(".login_overflow").classList.add("hidden");
});
