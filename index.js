const express = require("express");
const app = express();
const cors = require("cors");
const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const LoginRouter = require("./routes/LoginRouter")
const RegisterRouter = require("./routes/RegisterRouter")
const path = require("path")

dbConnect();

app.use(cors());
app.use(express.json());
app.use("/api/admin", LoginRouter);
app.use("/api/user", UserRouter);
app.use("/api/photos", PhotoRouter);
app.use("/api", RegisterRouter);
app.use("/images", express.static(path.join(__dirname, 'images')))

app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

app.listen(8081, () => {
  console.log("server listening on port 8081");
});
