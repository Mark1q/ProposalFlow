from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from ai_service import generate_proposal_markdown

class ScopeInput(BaseModel):
    budget: int
    features: list[str]
    timeline: str
    techStack: list[str]
    projectName: str
    businessGoal: str

app = FastAPI()

@app.exception_handler(RequestValidationError)
async def json_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    
    clean_errors = []
    for error in errors:
        field = error["loc"][-1]
        msg = error["msg"]
        clean_errors.append(f"{field}: {msg}")

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Validation failed",
            "errors": clean_errors
        },
    )

@app.post('/generate')
async def generate(scope_json: ScopeInput):
    data_dict = scope_json.model_dump() 
    
    markdown_text = await generate_proposal_markdown(data_dict)
    
    return JSONResponse(
        content={"finalMarkdown": markdown_text},
        media_type="application/json; charset=utf-8"
    )