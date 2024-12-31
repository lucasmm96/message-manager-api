const express = require('express');
const router = express.Router();
const swaggerUi = require("swagger-ui-express");

const swaggerDocument = require("../swagger.json");

router.use("/api-docs", swaggerUi.serve);
router.get("/api-docs", swaggerUi.setup(swaggerDocument));

router.get("/terms", async (req, res) =>
  res.status(200).json("Terms of Usage")
);

module.exports = router;
