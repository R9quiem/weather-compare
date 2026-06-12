from fastapi import FastAPI

from app.api.router import router

app = FastAPI(title="Weather Analysis API")

app.include_router(router)