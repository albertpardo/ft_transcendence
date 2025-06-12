const { exec } = require("child_process");

if (process.env.NODE_ENV === "production") {
  exec("npm run serve", { stdio: "inherit" });
} else {
  exec("npm run dev", { stdio: "inherit" });
}