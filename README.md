# Grammify: AI-Powered Writing Assistant & Educational Platform

Grammify is a full-stack, machine-learning-powered application designed to not only correct grammar but to actively teach users how to write and be better. 

Unlike standard text-correction tools, Grammify sits at the intersection of a **productivity tool** and an **educational platform** by featuring a unique, gamified "Practice Mode" where users must identify and correct grammar mistakes themselves to earn points and build learning streaks.

![Grammify Cover](https://via.placeholder.com/1000x400/1a1814/f7f4ef?text=Grammify+AI+Writing+Assistant)

---

## ✨ Features

* **Advanced Grammar Correction:** Powered by the massive `vennify/t5-base-grammar-correction` model, the app understands complex sentence structures and accurately fixes verb tenses, punctuations, and syntax.
* **🎯 Unique Feature: Practice Mode:** Instead of just fixing the text for you, the app pulls from a custom dataset to generate grammatically incorrect sentences. The user must type the correct fix. The app then diffs their answer against the AI's golden standard, providing a score out of 100, visual highlights of missed errors, and streak tracking.
* **Live Diff & Highlighting:** Instantly highlights exactly which words were removed, changed, or added in the corrected sentence so users can learn from their mistakes.
* **Tone Switching:** Dedicated tabs to rewrite sentences specifically for formal environments or simplified reading.
* **Premium Editorial UI:** A visually stunning, modern, and warm aesthetic moving away from generic "glassmorphism" into a grounded, professional design.

---

## 🛠️ The Tech Stack

### Frontend (Client)
* **React + Vite:** Blazing fast modern component framework.
* **Custom Vanilla CSS:** Utilizing a rich, bespoke design system with micro-animations.
* **Axios:** For robust asynchronous API communication.
* **Hosted on:** [Vercel](https://vercel.com)

### Backend (API)
* **Python + Flask:** Lightweight and efficient API routing.
* **Hugging Face Transformers / PyTorch:** Local execution of the heavy T5 model.
* **Flask-Limiter:** Built-in rate limiting to prevent DDOS attacks or inference overload.
* **Hosted on:** [Hugging Face Spaces](https://huggingface.co/spaces) (Docker Container / 16GB RAM)

---

## 🚀 Running the Project Locally

Because this project utilizes a heavy 900MB Machine Learning model, the backend requires slightly more setup than a standard web app.

### 1. Start the Machine Learning Backend
First, ensure you have Python 3.10+ installed.

```bash
cd backend
pip install -r requirements.txt
python app.py
```
*Note: The first time you run this, it will take ~1-2 minutes to download the Hugging Face AI model to your local cache.*

The backend will start running on `http://127.0.0.1:5000`.

### 2. Start the React Frontend
Open a new terminal window.

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## 🌍 How It Was Deployed

Because the AI model requires massive amounts of RAM during inference, the project utilizes a split-stack deployment strategy:

1. **The Backend** is packaged into a container using a custom `Dockerfile` and deployed to a Free Hugging Face Space, which provides an isolated Docker environment with 16GB of RAM.
2. **The Frontend** is deployed to Vercel. A Vercel environment variable (`VITE_API_URL`) securely routes user traffic from Vercel straight into the Hugging Face API port.

---

## 📂 Project Structure

```text
grammar-ai-project/
├── backend/                  # Python Flask API & Machine Learning
│   ├── app.py                # Main API routing (Health, Inference, Practice Mode)
│   ├── Dockerfile            # Hugging Face deployment config
│   ├── Procfile              # WSGI target command
│   ├── requirements.txt      # Python dependencies
│   ├── dataset/              # CSV used for the educational Practice Mode
│   └── model/
│       ├── inference.py      # T5 Model initialization & string manipulation logic
│       └── train.py          # Fine-tuning configurations
│
└── frontend/                 # React UI Web App
    ├── src/
    │   ├── App.jsx           # Main layout & state management
    │   ├── index.css         # Core CSS tokens & styles
    │   └── components/
    │       ├── PracticeMode.jsx   # Gamified educational mode
    │       ├── HighlightedText.jsx # Text differencing and highlighting
    │       └── ... 
    └── .env                  # Environment Variables
```
