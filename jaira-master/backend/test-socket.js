import { io } from "socket.io-client";

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTVmOTdmZmM0ZWI0ZWJkYjRkNGMyMmMiLCJlbWFpbCI6Imh1c3NpZW4xMTExMjU4QGdtYWlsLmNvbSIsInVzZXJyb2xlIjoidXNlciIsImlhdCI6MTc4NDgyOTM2MiwiZXhwIjoxODE2Mzg2OTYyLCJqdGkiOiJRRFkyVkVZTkY5SzIzMWRkakQ0U3UifQ.mntM5LG1OJM8tvtJDGim3X1RBGIsN7V7mOLpROd_Lxg";

const socketClient = io("http://localhost:3000", {


  auth: {
    authorization: `bearer ${token}`,
  },
});

socketClient.on("connect", () => {
  console.log("✅ Connected:", socketClient.id);
});

socketClient.on("disconnect", (reason) => {
  console.log("❌ Disconnected:", reason);
});

socketClient.on("connect_error", (err) => {
  console.error("❌ Connection Error");
  console.error("Message:", err.message);
  console.error(err);
});
