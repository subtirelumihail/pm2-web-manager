const express = require("express");
const cors = require("cors");
const fs = require("fs");
const os = require("os");
var cp = require("child_process");
var bodyParser = require("body-parser");

const app = express();
const port = 8080;

const pm2 = require("pm2");

app.use(
  cors({
    origin: "*",
  })
);

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/list", (req, res) => {
  var pwd = require("child_process")
    .execSync("eval echo ~$USER")
    .toString()
    .replace("\n", "");

  pm2.connect(function (err) {
    if (err) {
      return res.json({
        error: err,
      });
    }
    pm2.list((err, list) => {
      if (err) {
        return res.json({
          error: err,
        });
      }
      const mapList = list.map((item) => ({
        id: item.pm_id,
        name: item.name,
        status: item.pm2_env.status,
        uptime: item.pm2_env.pm_uptime,
        restarts: item.pm2_env.restart_time,
        memory: item.monit.memory,
        cpu: item.monit.cpu,
      }));
      res.json({
        totalOnlineProcesses: mapList.filter((item) => item.status === "online")
          .length,
        totalStoppedProcesses: mapList.filter(
          (item) => item.status !== "online"
        ).length,
        totalMemory:
          mapList.reduce((sum, value) => sum + value.memory, 0).toFixed(2) || 0,
        totalCPU:
          mapList.reduce((sum, value) => sum + value.cpu, 0).toFixed(2) || 0,
        systemMemory: os.totalmem(),
        list: mapList,
        pwd,
      });
    });
  });
});

app.get("/logs/:pid", (req, res) => {
  pm2.describe(req.params.pid, (err, proc) => {
    if (err) {
      return res.json({
        error: err,
      });
    }

    res.json({
      output: fs.readFileSync(proc[0].pm2_env.pm_out_log_path, "utf8"),
      error: fs.readFileSync(proc[0].pm2_env.pm_err_log_path, "utf8"),
    });
  });
});

app.get("/process/:pid", (req, res) => {
  pm2.describe(req.params.pid, (err, proc) => {
    console.log(err);
    if (err) {
      return res.json({
        error: err,
      });
    }
    res.json(proc);
  });
});

app.post("/start/:pid", (req, res) => {
  pm2.start(req.params.pid, (err, proc) => {
    if (err) {
      return res.json({
        error: err,
      });
    }
    res.json({
      success: true,
      data: proc[0],
    });
  });
});

app.post("/restart/:pid", (req, res) => {
  pm2.restart(req.params.pid, (err, proc) => {
    if (err) {
      return res.json({
        error: err,
      });
    }
    res.json({
      success: true,
      data: proc[0],
    });
  });
});

app.post("/reload/:pid", (req, res) => {
  pm2.reload(req.params.pid, (err, proc) => {
    if (err) {
      return res.json({
        error: err,
      });
    }
    res.json({
      success: true,
      data: proc[0],
    });
  });
});

app.post("/stop/:pid", (req, res) => {
  pm2.stop(req.params.pid, (err, proc) => {
    console.log(err);
    if (err) {
      return res.json({
        error: err,
      });
    }
    res.json({
      success: true,
      data: proc[0],
    });
  });
});

app.post("/delete/:pid", (req, res) => {
  pm2.delete(req.params.pid, (err, proc) => {
    if (err) {
      return res.json({
        error: err,
      });
    }
    res.json({
      success: true,
      data: proc[0],
    });
  });
});

app.get("/logs", function (req, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-control": "no-cache",
  });

  var spw = cp.spawn("pm2", ["logs", "--lines", "10"]),
    str = "";

  spw.stdout.on("data", function (data) {
    str = "";
    str += data.toString();

    // Flush out line by line.
    var lines = str.split("\n");
    for (var i in lines) {
      if (i === lines.length - 1) {
        str = lines[i];
      } else {
        // Note: The double-newline is *required*
        res.write("data: " + lines[i] + "\n\n");
      }
    }
  });

  spw.on("close", function (code) {
    res.end(str);
  });

  spw.stderr.on("data", function (data) {
    res.end("stderr: " + data);
  });
});

app.post("/create", (req, res) => {
  const settings = Object.fromEntries(
    Object.entries(req.body).filter(([_, v]) => v)
  );

  pm2.start(settings, (err, proc) => {
    if (err) {
      console.log(err);
      return res.json({
        error: err.toString(),
      });
    }
    res.json({
      success: true,
      data: proc[0],
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
