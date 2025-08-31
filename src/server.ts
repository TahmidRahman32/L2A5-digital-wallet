import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envConfig } from "./app/middlewares/config/env";
import { seedAdmin } from "./app/middlewares/Utils/seedAdmin";
// import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";

let server: Server;

const startServer = async () => {
   try {
      await mongoose.connect(envConfig.DB_URL);

      console.log("connected to database");

      server = app.listen(envConfig.PORT, () => {
         console.log("server is running port 50000");
      });
   } catch (error) {
      console.log(error, "not is correct wey");
   }
};

(async () => {
   await startServer();
   await seedAdmin();
})();

process.on("SIGTERM", () => {
   console.log("SIGTERM signal received... server shutting down..");
   if (server) {
      server.close(() => {
         process.exit(1);
      });
   }
   process.exit(1);
});
process.on("SIGINT", () => {
   console.log("SIGINT signal received... server shutting down..");
   if (server) {
      server.close(() => {
         process.exit(1);
      });
   }
   process.exit(1);
});
process.on("unhandledRejection", (err) => {
   console.log("unhandled Rejection detected... server shutting down..", err);
   if (server) {
      server.close(() => {
         process.exit(1);
      });
   }
   process.exit(1);
});
process.on("uncaughtException", (err) => {
   console.log("uncaught Exception detected... server shutting down..", err);
   if (server) {
      server.close(() => {
         process.exit(1);
      });
   }
   process.exit(1);
});

// Promise.reject(new Error("I forgot to catch this promise "));

// throw new Error("I forgot to catch this local error ");
