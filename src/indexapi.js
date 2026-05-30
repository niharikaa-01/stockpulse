const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const BRIGHT_DATA_API_KEY = "c75eaf2a-b658-4d49-89fc-787eb92";

app.get("/api/analyze/:company", async (req, res) => {
  const { company } = req.params;
  try {
    const url = `https://api.brightdata.com/serp/google?query=${encodeURIComponent(company + " stock earnings news")}&country=us`;
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${BRIGHT_DATA_API_KEY}`,
      },
    });
    const data = await response.json();
    res.json({ success: true, data });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.listen(process.env.PORT || 3001, () => {
  console.log("Server running on port", process.env.PORT || 3001);
});