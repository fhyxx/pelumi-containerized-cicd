
const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Pelumi's Cloud Project</title>
      </head>
      <body>
        <h1>Project 02: Containerized CI/CD Pipeline</h1>
        <p>Hello! My Node.js application is running.</p>
        <p>Built by Pelumi Oke.</p>
      </body>
    </html>
  `);
});

if (require.main === module) {
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Application running on port ${PORT}`);
    });
}

module.exports = app;
