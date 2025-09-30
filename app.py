from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from efficientnet import run_pipeline, load_model
from nlp.main import return_solution, chat_with_ai  # ← GPT 기반 해결책 생성 함수 및 채팅 함수
from PIL import Image
from pydantic import BaseModel
import io, base64, socket

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

def get_local_ip():
    """현재 컴퓨터의 로컬 IP 주소를 가져옵니다."""
    try:
        # 외부 연결을 시도하여 로컬 IP 확인
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        # 실패 시 localhost 반환
        return "127.0.0.1"

class ImageBase64Request(BaseModel):
    image_base64: str

class ChatRequest(BaseModel):
    message: str


@app.get("/server-info/")
async def get_server_info():
    """서버 정보를 반환합니다 (IP 주소, 포트 등)."""
    return {
        "ip": get_local_ip(),
        "port": 8000,
        "base_url": f"http://{get_local_ip()}:8000"
    }

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

@app.post("/chat/")
async def chat(data: ChatRequest):
    try:
        # AI와 채팅
        response = chat_with_ai(data.message)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"채팅 처리 실패: {str(e)}")