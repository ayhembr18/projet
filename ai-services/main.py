import os
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

skill_model = None
pred_engine = None


def load_models():
    """Load models from disk. Called at startup."""
    global skill_model, pred_engine

    # Models must be loaded from the same module that defines the classes,
    # so we import fix_models to register the classes in sys.modules first,
    # then joblib can deserialize them correctly.
    try:
        import fix_models  # noqa: F401 — registers SmartSkillGapAnalyzer & AIPredictionEngine
    except ImportError:
        logger.warning("fix_models.py not found in path — classes may not deserialize correctly")

    base_path = os.path.dirname(os.path.abspath(__file__))
    path_skill = os.path.join(base_path, "model", "skill_gap_model.pkl")
    path_pred  = os.path.join(base_path, "model", "prediction_engine.pkl")

    if os.path.exists(path_skill):
        try:
            import joblib
            skill_model = joblib.load(path_skill)
            logger.info("✅ Skill gap model loaded")
        except Exception as e:
            logger.error(f"❌ Failed to load skill model: {e}")
    else:
        logger.warning(f"Skill model not found at {path_skill} — run fix_models.py first")

    if os.path.exists(path_pred):
        try:
            import joblib
            pred_engine = joblib.load(path_pred)
            logger.info("✅ Prediction engine loaded")
        except Exception as e:
            logger.error(f"❌ Failed to load prediction engine: {e}")
    else:
        logger.warning(f"Prediction engine not found at {path_pred} — run fix_models.py first")


@app.on_event("startup")
async def startup_event():
    load_models()


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "skill_model": skill_model is not None,
        "pred_engine": pred_engine is not None,
    }


@app.post("/analyze")
async def analyze(request: Request):
    data = await request.json()
    if skill_model is None:
        return {"error": "Skill model not loaded. Run fix_models.py to generate model files."}
    try:
        return skill_model.analyze(data)
    except Exception as e:
        logger.error(f"Analyze error: {e}")
        return {"error": str(e)}


@app.post("/predict")
async def predict(request: Request):
    data = await request.json()
    if pred_engine is None:
        return {"error": "Prediction engine not loaded. Run fix_models.py to generate model files."}
    try:
        return pred_engine.predict(data)
    except Exception as e:
        logger.error(f"Predict error: {e}")
        return {"error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=False)