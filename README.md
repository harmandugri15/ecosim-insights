# 🌿 EcoSim | Enterprise LCA AI

EcoSim replaces static carbon calculators with real-time Machine Learning and LiveAI streaming. Built for enterprise supply chains, it optimizes logistics, audits ESG greenwashing via NLP, and tracks live organizational emissions.

## 🚀 Core Features

- **LiveAI Enterprise Analytics:** Powered by the **Pathway** framework, EcoSim ingests streaming IoT supply chain data and runs real-time ML inference.
- **B2B LCA Simulator:** A custom-trained Random Forest Regressor predicts Scope 3 emissions based on material extraction, grid intensity, and freight modes.
- **Greenwashing NLP Auditor:** Integrates a Hugging Face `DistilBERT` zero-shot classification pipeline to semantically analyze and score ESG marketing claims.
- **Fleet Transit Logic:** Calculates Well-to-Wheels footprints, per-passenger emissions, and EV manufacturing payback times.

## 💻 Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS & shadcn/ui
- Recharts (Dynamic Data Visualization)

**Backend & ML Engine:**
- Python 3 & FastAPI
- Pathway (Streaming LiveAI Framework)
- Scikit-Learn (Random Forest)
- Hugging Face `transformers` (DistilBERT)
- Pandas & NumPy

---

## 🛠️ Getting Started

To run EcoSim locally, you will need to start both the LiveAI Python backend and the React frontend.

### 1. Start the Backend (Microservice Architecture)
Navigate to the `backend` directory and install the required Python dependencies:

```bash
cd backend
pip install fastapi uvicorn pandas scikit-learn transformers torch pathway joblib
Because EcoSim uses a live event-driven architecture, you need to run three separate processes. Open three terminal windows in the backend folder and run one command in each:

Terminal 1 (IoT Data Stream): ```bash
python data_generator.py

Terminal 2 (Pathway Inference Engine): ```bash
python pathway_engine.py

Terminal 3 (FastAPI REST Server): ```bash
uvicorn main:app --reload --port 8000


2. Start the Frontend Application
Open a new terminal at the root of the project to install Node modules and spin up the UI:

Bash
npm install
npm run dev
The application will now be running locally at http://localhost:5173.

Built for the Hack For Green Bharat Hackathon.


### How to apply this and push it:
1. Replace the contents of your `README.md` with the text above.
2. Run these commands in your terminal to sync it to GitHub:
   ```bash
   git add README.md
   git commit -m "Update README with professional project architecture"
   git push origin main
