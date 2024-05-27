const express = require("express");
const cors = require("cors");
const { PORT } = require("./config/server.config");
const apiRouter = require("./routes");
const app = express();

const corsOptions = {
  origin: "https://main--stately-florentine-58efc8.netlify.app",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use("/api", apiRouter);

app.listen(PORT, () => {
  console.log(`Server Started at PORT ${PORT}`);
});
