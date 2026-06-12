from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.v1 import predict, report
import os

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description="CardioTwin AI - Explainable Bayesian Cardiovascular Risk Platform",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # CORS Middleware (allow frontend origin)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://localhost:3000",
            "https://cardiotwin.vercel.app"
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register API Routers
    prefix = settings.API_V1_STR
    app.include_router(predict.router, prefix=prefix)
    app.include_router(report.router, prefix=prefix)

    @app.get("/", tags=["Health"])
    async def root():
        return {
            "service": settings.PROJECT_NAME,
            "status": "✅ Running",
            "version": "1.0.0",
            "docs": "/docs"
        }

    @app.get("/health", tags=["Health"])
    async def health_check():
        from app.services.bayesian import bayesian_engine
        from app.services.xgboost import xgboost_engine
        return {
            "status": "healthy",
            "bayesianModel": "loaded" if bayesian_engine.model else "missing",
            "xgboostModel": "loaded" if xgboost_engine.model else "missing"
        }

    return app


app = create_app()
