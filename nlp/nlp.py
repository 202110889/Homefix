from nlp.retriever import load_index
from nlp.generator import generate_gpt_answer
from nlp.simple_conversation import process_user_message
import numpy as np
from sklearn.preprocessing import normalize

# 서버 시작 시 1회만 로딩
retriever, index, docs, problem_texts = load_index()

def return_solution(label: str, loc: str):
    question = f"{loc}에서 {label} 제거하는 법 알려줘."

    # 질문 임베딩
    query_embedding = retriever.encode([question], convert_to_tensor=False)
    query_embedding = np.array(query_embedding).astype("float32")
    query_embedding = normalize(query_embedding, norm='l2')

    # FAISS 검색
    distances, labels = index.search(query_embedding, k=5)
    best_dist = distances[0][0]
    filtered_docs = [
        docs[i] for i, dist in zip(labels[0], distances[0]) if dist <= best_dist + 0.05
    ]

    # 문맥 구성
    context = "\n\n---\n\n".join(filtered_docs)

    # GPT로 해결책 생성
    answer = generate_gpt_answer(question, context)
    return answer

def chat_with_ai(user_message: str):
    """
    사용자 메시지에 대한 스마트한 채팅 응답을 생성합니다.
    구체적이지 않은 질문의 경우 추가 질문을 통해 더 정확한 답변을 제공합니다.
    """
    
    # 대화 처리
    response_message, is_final_answer = process_user_message(user_message)
    
    if not is_final_answer:
        # 추가 질문이 필요한 경우
        return response_message
    
    # 최종 답변을 생성하는 경우
    search_query = response_message
    
    # 홈 수리 관련 키워드 체크
    home_repair_keywords = [
        # 기본 수리 키워드
        "수리", "고장", "문제", "고치", "교체", "설치", "청소", "정리",
        
        # 공간별 키워드
        "배관", "전기", "벽지", "바닥", "천장", "문", "창문", "가구",
        "화장실", "부엌", "거실", "침실", "베란다", "지하실", "다락방",
        
        # 가전제품
        "냉장고", "세탁기", "에어컨", "보일러", "가스", "전자레인지", "오븐",
        "식기세척기", "정수기", "공기청정기", "청소기", "드라이어",
        
        # 오염 및 손상
        "기름때", "물때", "곰팡이", "녹", "얼룩", "때", "오염", "손상",
        "찌든때", "누적때", "세균", "바이러스", "악취", "냄새",
        
        # 재료 및 표면
        "타일", "마루", "카펫", "페인트", "도배", "벽지", "유리", "거울",
        "스테인리스", "플라스틱", "나무", "금속", "세라믹", "대리석",
        
        # 문제 유형
        "누수", "누전", "단락", "화재", "폭발", "파손", "균열", "틈새",
        "부식", "변색", "탈색", "찌그러짐", "찢어짐", "깨짐",
        
        # 청소 도구 및 방법
        "세제", "솔", "걸레", "스펀지", "브러시", "세정제", "표백제",
        "소독", "살균", "탈취", "방취", "방습", "방수", "방충",
        
        # 전문 용어
        "배수", "급수", "배선", "전기배선", "가스배관", "난방", "냉방",
        "환기", "통풍", "습기", "온도", "습도", "압력", "유량"
    ]
    
    # 사용자 메시지에 홈 수리 관련 키워드가 있는지 확인
    has_home_repair_context = any(keyword in search_query for keyword in home_repair_keywords)
    
    if has_home_repair_context:
        # 홈 수리 관련 질문인 경우 임베딩과 FAISS 검색 사용
        # 질문 임베딩
        query_embedding = retriever.encode([search_query], convert_to_tensor=False)
        query_embedding = np.array(query_embedding).astype("float32")
        query_embedding = normalize(query_embedding, norm='l2')

        # FAISS 검색
        distances, labels = index.search(query_embedding, k=5)
        best_dist = distances[0][0]
        filtered_docs = [
            docs[i] for i, dist in zip(labels[0], distances[0]) if dist <= best_dist + 0.05
        ]

        # 문맥 구성
        context = "\n\n---\n\n".join(filtered_docs)
        
        # 추가 컨텍스트 정보
        additional_context = f"""
        사용자 질문: {search_query}
        
        위의 관련 문서들을 참고하여 다음을 포함한 답변을 제공해주세요:
        - 안전을 최우선으로 고려한 조언
        - 단계별 해결 방법
        - 필요한 도구나 재료
        - 전문가 상담이 필요한 경우 언급
        """
        
        # 최종 컨텍스트 결합
        final_context = f"{additional_context}\n\n관련 문서:\n{context}"
        
    else:
        # 일반적인 질문인 경우 기본 컨텍스트 사용
        final_context = f"""
        사용자가 다음과 같이 질문했습니다: {search_query}
        
        홈 수리 전문 AI 어시스턴트로서 친근하고 도움이 되는 답변을 제공해주세요.
        가능하면 홈 수리와 관련된 조언으로 연결해주세요.
        """
    
    # GPT로 응답 생성
    answer = generate_gpt_answer(search_query, final_context)
    return answer