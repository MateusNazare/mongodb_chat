import "dotenv/config";
import "express-async-errors";

import { AppError } from "./error/AppError.js";
import express from "express";

import { router } from "./routes/index.js";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(router);

app.use((err, request, response, next) => {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      message: err.message,
    });
  }

  // if (err instanceof ValidationError) {
  //   return response.status(err.statusCode).json(err);
  // }

  return response.status(500).json({
    status: "error",
    message: `Internal server error - ${err.message}`,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
