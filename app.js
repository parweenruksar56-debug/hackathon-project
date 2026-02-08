// server.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory state (for demo purposes)
let modelState = {
  status: "Not Trained",
  lastTrained: null,
  metrics: {
    accuracy: null,
    precision: null,
    recall: null,
    f1: null,
    roc_auc: null,
    mcc: null
  },
  classDistribution: {
    "False Positive": 48,
    "Candidate": 28,
    "Confirmed": 24
  },
  logs: []
};

// Training logs template
const trainingLogsTemplate = [
  "[2026-02-07 14:32:01] Initializing ensemble...",
  "[14:32:05] Loaded 11,248 samples (Kepler+TESS 2026)",
  "[14:32:12] Applying SMOTE-NC → 18,920 balanced samples",
  "[14:32:45] XGBoost round 1/5 – best iter 380",
  "[14:33:10] LightGBM training – early stopping at 420",
  "[14:34:02] CatBoost fit complete",
  "[14:34:55] Attention NN epoch 18/50 – val_loss: 0.214",
  "[14:35:40] Ensemble voting weights optimized",
  "[14:36:15] Evaluation complete – final metrics computed"
];

// Final metrics after training (realistic values)
const trainedMetrics = {
  accuracy: 94.7,
  precision: 92.1,
  recall: 95.3,
  f1: 93.8,
  roc_auc: 98.2,
  mcc: 89.4
};

// Routes

app.get('/', (req, res) => {
  res.json({ message: "Exoplanet AI Backend is running" });
});

app.get('/status', (req, res) => {
  res.json({
    status: modelState.status,
    lastTrained: modelState.lastTrained,
    metrics: modelState.metrics,
    classDistribution: modelState.classDistribution,
    recentLogs: modelState.logs.slice(-10) // last 10 lines
  });
});

app.post('/train', (req, res) => {
  const { test_split = 22, balancing = "SMOTE-NC" } = req.body;

  if (modelState.status === "Training") {
    return res.status(409).json({ error: "Training is already in progress" });
  }

  // Reset state
  modelState.status = "Training";
  modelState.logs = [];
  modelState.metrics = {
    accuracy: null,
    precision: null,
    recall: null,
    f1: null,
    roc_auc: null,
    mcc: null
  };

  let i = 0;

  const interval = setInterval(() => {
    if (i < trainingLogsTemplate.length) {
      const timestamp = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const logLine = trainingLogsTemplate[i].replace(/^\[\d{2}:\d{2}:\d{2}\]/, `[${timestamp}]`);
      modelState.logs.push(logLine);
      i++;
    } else {
      // Finish training
      clearInterval(interval);

      modelState.status = "Trained";
      modelState.lastTrained = new Date().toISOString();
      modelState.metrics = { ...trainedMetrics };

      // Slight variation in class distribution
      modelState.classDistribution = {
        "False Positive": Math.floor(Math.random() * 6) + 45,
        "Candidate": Math.floor(Math.random() * 6) + 25,
        "Confirmed": Math.floor(Math.random() * 6) + 22
      };

      return res.json({
        status: "Trained",
        logs: modelState.logs,
        metrics: modelState.metrics,
        classDistribution: modelState.classDistribution
      });
    }
  }, 900); // ~0.9 seconds per log line

  // Immediate response: training has started
  res.json({
    status: "Training started",
    message: "Training in progress..."
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Exoplanet AI backend running on http://localhost:${PORT}`);
});