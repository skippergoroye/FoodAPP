import express, { Request, Response } from "express";
import logger from "morgan";
import cookieParser from "cookie-parser";
import { sequelizeDB } from "./config/index";
import indexRouter from "./routes/index";
import userRouter from "./routes/Users";
import dotenv from "dotenv";
dotenv.config();




// Sequelize connection {force: true}
sequelizeDB.sync().then(()=>{
  console.log("Db connected successfuly")
}).catch(err=>{
  console.log(err)
})




// (async () => {
//     await db.sync({ force: true });
//     console.log("Db connected successfuly")
// })();




// try {
//     sequelize.authenticate();
//     console.log('Connection has been established successfully.');
// } catch (error) {
//     console.error('Unable to connect to the database:', error);
// }




// Sequalize connection {force: true}
// (async () => {
//   try {
//     await sequelizeDB.authenticate();
//     console.log("Connection has been established successfully.");
//   } catch (error) {
//     console.error("Unable to connect to the database:", error);
//   }
// })();




const app = express();

app.use(express.json());
app.use(logger("dev"));
app.use(cookieParser());



//Router middleware
app.use("/", indexRouter);
app.use("/users", userRouter);



const port = 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;
