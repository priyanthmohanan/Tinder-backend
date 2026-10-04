const express = require("express");
const { connectDB } = require("./config/database");
const cookieParser = require("cookie-parser");
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');
const { userRouter } = require('./routes/user');
const cors = require("cors");

const app = express();
console.log("CORS CONFIG LOADED — METHODS:", ["GET", "POST", "PATCH", "PUT", "DELETE"]);
app.use(
  cors({
    origin: "http://localhost:5173", // your Vite frontend, exact origin, no trailing slash
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

//Database connection

connectDB()
  .then(() => {
    console.log("DB connection established...");
    app.listen(3000, () => {
      console.log("Server started on port 3000");
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1); // don't start server if DB isn't up
  });