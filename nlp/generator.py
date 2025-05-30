from openai import OpenAI
import os
from dotenv import load_dotenv

# .env 파일에서 OPENAI_API_KEY 불러오기
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_gpt_answer(question, context):
    prompt = f"""
        당신은 유능한 AI 어시스턴트입니다. 반드시 아래 문맥(Context)에 기반하여 답변해주세요.
        문맥에 없는 내용은 상상하지 말고, 모르면 모른다고 말하세요.
        📌 문맥의 내용을 요약하지 말고, 단계별로 구체적으로 설명해주세요.
        특히 "해결 방법", "예방 팁"을 빠짐없이 반영하여 설명해주세요.

        [문맥 정보]
        {context}

        [질문]
        {question}
        """.strip()

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            { "role": "system", "content": "친절한 한국어 홈케어 전문가입니다."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=1024
    )
    return response.choices[0].message.content.strip()