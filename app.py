from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from efficientnet import run_pipeline, load_model
from nlp.nlp import return_solution  # ← GPT 기반 해결책 생성 함수
from PIL import Image
from pydantic import BaseModel
import io, base64

app = FastAPI()

# CORS 허용 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제 서비스에선 "*" 대신 앱 주소 권장
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# EfficientNet 모델 로딩 (서버 시작 시 한 번만
model = load_model()

class ImageBase64Request(BaseModel):
    image_base64: str

@app.post("/analyze/")
async def analyze(data: ImageBase64Request):
    try:
        # 이미지 읽기
        print("✅ 받은 base64 길이:", len(data.image_base64))
        image_bytes = base64.b64decode(data.image_base64)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"이미지 처리 실패: {str(e)}")

    # 문제 유형 + 위치 예측
    problem, location = run_pipeline(image, model=model)

    # 해결책 생성
    solution = return_solution(problem, location)

    return {
        "problem": problem,
        "location": location,
        "solution": solution
    }

# 명령어 -> uvicorn app:app --host 0.0.0.0 --port 8000 --reload
# FastAPI가 모든 IP에서의 접속을 허용하도록 설정
# PC랑 앱이랑 같은 WIFI에 속해 있어야 함.