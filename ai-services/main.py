import os
import joblib
import logging
import sys
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- CLASSES DE BASE ---
class SmartSkillGapAnalyzer:
    def analyze(self, data): return {"status": "default", "message": "Analyzer logic missing"}

class AIPredictionEngine:
    def predict(self, data): return {"status": "default", "message": "Prediction logic missing"}

# --- INJECTION DANS TOUS LES MODULES ---
# On force Python à trouver les classes partout pour Joblib
current_module = sys.modules[__name__]
setattr(current_module, 'SmartSkillGapAnalyzer', SmartSkillGapAnalyzer)
setattr(current_module, 'AIPredictionEngine', AIPredictionEngine)
sys.modules['__main__'] = current_module

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

skill_model = None
pred_engine = None

@app.on_event("startup")
async def load_models():
    global skill_model, pred_engine
    try:
        # On utilise des chemins absolus pour être sûr sous Windows
        base_path = os.path.dirname(os.path.abspath(__file__))
        path_skill = os.path.join(base_path, "model", "skill_gap_model.pkl")
        path_pred = os.path.join(base_path, "model", "prediction_engine.pkl")

        if os.path.exists(path_skill):
            skill_model = joblib.load(path_skill)
            logger.info("✅ Skill Model LOADED")
        
        if os.path.exists(path_pred):
            pred_engine = joblib.load(path_pred)
            logger.info("✅ Prediction Engine LOADED")
            
    except Exception as e:
        logger.error(f"❌ Erreur de chargement : {e}")

@app.post("/analyze")
async def analyze(request: Request):
    data = await request.json()
    if skill_model:
        return skill_model.analyze(data)
    return {"error": "Model not loaded"}

@app.post("/predict")
async def predict(request: Request):
    data = await request.json()
    if pred_engine:
        return pred_engine.predict(data)
    return {"error": "Engine not loaded"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)