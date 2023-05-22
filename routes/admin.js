const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");
const authController = require("../controllers/auth");
const checkAuth = require("../middleware/check-auth");
const isBodyArray = require("../middleware/isBodyArray");

router.post("/auth/signup", authController.postSignup);
router.post("/auth/login", authController.postLogin);

router.use("/", (req, res) => {
  res.send("Message Manager API is up and running");
});

router.use(checkAuth);

router.get("/message/list", adminController.getMessageList);
router.get("/message/find", isBodyArray, adminController.getMessageById);
router.post("/message/add", isBodyArray, adminController.postAddMessage);
router.post("/message/update", isBodyArray, adminController.postUpdateMessage);
router.post("/message/delete", isBodyArray, adminController.getDeleteMessage);

module.exports = router;
