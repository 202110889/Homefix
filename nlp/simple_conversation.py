from typing import Dict, List, Tuple, Optional
from sentence_transformers import SentenceTransformer, util

# 전역 retriever 초기화
model = SentenceTransformer("jhgan/ko-sroberta-multitask")

# 대상 목록
objects = ["후라이팬", "냉장고", "가스레인지", "인덕션", "오븐", "전자레인지", "식기세척기", "정수기", "주방 싱크대", 
            "타일", "변기", "배수구", "하수구", "유리", "거울", "스테인리스", "수전",
            "욕조", "샤워기", "세면대", "세탁기", "수도꼭지",
            "에어컨", "보일러", "벽지", "바닥", "천장", "문", "창문", "공기청정기", "문고리", "자물쇠", "경첩", "가구"]

# 문제 목록
problems = ["기름때", "물때", "곰팡이", "녹", "얼룩", "누수", "누전", "단락", "파손",
            "부식", "변색", "탈색", "찌그러짐", "찢어짐", "막힘", "뚫기", "뚫는법", 
            "고장", "작동안함", "안됨", "문제", "이상"]

all_objects = ["후라이팬", "프라이팬", "냉장고", "가스레인지", "인덕션", "오븐", "전자레인지", "식기세척기", "정수기", "싱크대", 
            "타일", "변기", "배수구", "배수", "하수구", "하수" , "유리", "거울", "스테인리스", "수전",
            "욕조", "샤워기", "세면대", "세탁기", "수도꼭지",
            "에어컨", "보일러", "벽지", "바닥", "천장", "문", "창문", "공기청정기", "문고리", "자물쇠", "경첩", "가구"]
# 모든 객체-문제 조합 생성
combined_prompts = []
for obj in objects:
    for prob in problems:
        combined_prompts.append(f"{obj} {prob}")

combined_emb = model.encode(combined_prompts, convert_to_tensor=True)

def embedding_based_specificity(user_message: str):
    """SentenceTransformer를 사용한 구체성 판단"""
    
    try:
        # 사용자 질문 임베딩
        query_emb = model.encode(user_message, convert_to_tensor=True)
        
        # 1. 모든 객체-문제 조합과 유사도 계산
        combined_scores = util.cos_sim(query_emb, combined_emb)[0]
        best_combined_score = combined_scores.max().item()
        best_combined_idx = combined_scores.argmax().item()
        best_combination = combined_prompts[best_combined_idx]
        
        # 2. 객체 키워드 매칭 확인
        has_object_keywords = any(obj in user_message for obj in all_objects)
        found_objects = [obj for obj in all_objects if obj in user_message]
        
        print(f"조합 유사도: {best_combined_score:.3f} ({best_combination})")
        print(f"객체 키워드 포함: {has_object_keywords} ({found_objects})")
        
        # 조합 유사도와 객체 키워드 모두 확인해야 구체적
        is_combined_specific = best_combined_score >= 0.7
        is_object_keyword_present = has_object_keywords
        
        print(f"조합 구체적: {is_combined_specific}, 객체 키워드 포함: {is_object_keyword_present}")
        
        return is_combined_specific and is_object_keyword_present
    except Exception as e:
        print(f"임베딩 기반 구체성 판단 중 에러 발생: {e}")
        # 에러 발생 시 기본적으로 구체적이라고 판단 (fallback)
        return True

class SimpleConversationManager:
    """간단한 대화 상태 관리 클래스"""
    
    def __init__(self):
        self.waiting_for_clarification = False
        self.question_context = None
        self.user_original_question = None
    
    def reset(self):
        """대화 상태 초기화"""
        self.waiting_for_clarification = False
        self.question_context = None
        self.user_original_question = None

# 전역 대화 관리자
conversation_manager = SimpleConversationManager()

def is_specific_content(user_message: str, context: Optional[str] = None) -> Tuple[bool, Optional[str]]:
    """
    메시지가 구체적인지 판단 (임베딩 기반)
    """
    
    # 모든 경우 임베딩 기반 구체성 판단
    is_specific = embedding_based_specificity(user_message)
    
    if is_specific:
        return True, "specific"
    else:
        return False, "general"

def generate_clarification_question(user_message: str, question_type: str) -> str:
    """구체적이지 않은 질문에 대한 추가 질문 생성"""
    # 원본 질문 저장
    conversation_manager.user_original_question = user_message
    conversation_manager.waiting_for_clarification = True
    
    if "기름때" in user_message:
        conversation_manager.question_context = "grease"
        return """기름때 제거는 대상에 따라 방법이 다릅니다.

어디에서 기름때를 제거하고 싶으신가요?

• 후라이팬/팬
• 인덕션/가스레인지  
• 벽지/벽면
• 바닥
• 옷/직물

구체적인 위치를 알려주시면 더 정확한 방법을 안내해드릴게요!"""

    elif "곰팡이" in user_message:
        conversation_manager.question_context = "mold"
        return """곰팡이 제거는 발생 위치에 따라 방법이 다릅니다.

어디에 곰팡이가 생겼나요?

• 화장실 타일/실리콘
• 벽지/벽면
• 천장
• 옷장/서랍
• 부엌 싱크대

구체적인 위치를 알려주시면 더 정확한 방법을 안내해드릴게요!"""

    elif "물때" in user_message:
        conversation_manager.question_context = "water_stain"
        return """물때 제거는 표면에 따라 방법이 다릅니다.

어디에서 물때를 제거하고 싶으신가요?

• 화장실 거울/유리
• 싱크대/수도꼭지
• 샤워부스/욕조
• 세탁기
• 기타

구체적인 위치를 알려주시면 더 정확한 방법을 안내해드릴게요!"""

    elif "녹" in user_message:
        conversation_manager.question_context = "rust"
        return """녹 제거는 재질과 상태에 따라 방법이 다릅니다.

어디에서 녹을 제거하고 싶으신가요?

• 수도꼭지/파이프
• 자전거/금속제품
• 도구/공구
• 자동차
• 기타

구체적인 위치를 알려주시면 더 정확한 방법을 안내해드릴게요!"""

    elif any(keyword in user_message for keyword in ["청소", "정리", "세척"]):
        conversation_manager.question_context = "cleaning"
        return """청소는 공간에 따라 방법이 다릅니다.

어떤 공간용을 청소하고 싶으신가요?

• 화장실
• 부엌
• 거실
• 침실
• 베란다

구체적인 공간을 알려주시면 더 정확한 방법을 안내해드릴게요!"""

    elif any(keyword in user_message for keyword in ["막힘", "뚫기", "막힌", "뚫린", "배수", "하수"]):
        conversation_manager.question_context = "clog"
        return """배수구나 변기 막힘은 위치에 따라 해결 방법이 다릅니다.

어디가 막혔나요?

• 변기
• 화장실 배수구
• 싱크대 배수구
• 욕조/샤워기 배수구
• 세면대 배수구
• 기타

구체적인 위치를 알려주시면 더 정확한 방법을 안내해드릴게요!"""

    elif any(keyword in user_message for keyword in ["고장", "작동안함", "안됨", "안돼", "문제", "이상", "오류"]):
        conversation_manager.question_context = "repair"
        return """고장이나 문제는 대상에 따라 해결 방법이 다릅니다.

어떤 것이 고장났나요?

• 문고리/자물쇠
• 서랍/옷장
• 가구 (침대, 소파, 책상, 의자)
• 가전제품
• 기타

구체적인 대상을 알려주시면 더 정확한 방법을 안내해드릴게요!"""

    else:
        conversation_manager.question_context = "general"
        return """더 구체적인 정보가 필요합니다.

어떤 문제가 발생했고, 어디에서 발생했는지 알려주시면 더 정확한 해결책을 제공할 수 있습니다.

예시:
• "화장실에서 곰팡이 제거 방법"
• "후라이팬 기름때 제거 방법"
• "부엌 싱크대 물때 제거 방법"

구체적으로 알려주세요!"""

def create_specific_query(user_message: str) -> str:
    """구체적인 검색 쿼리 생성"""
    
    if conversation_manager.waiting_for_clarification:
        # 추가 정보를 받은 경우
        original_question = conversation_manager.user_original_question or ""
        specific_query = f"{user_message}에서 {original_question}"
        
        # 대화 상태 초기화
        conversation_manager.reset()
        
        return specific_query
    else:
        # 이미 구체적인 질문인 경우
        return user_message

def process_user_message(user_message: str) -> Tuple[str, bool]:
    """
    사용자 메시지를 처리하고 응답 생성
    
    Returns:
        Tuple[응답_메시지, 최종_답변_여부]
    """
    
    # 추가 질문을 기다리는 중인지 확인
    if conversation_manager.waiting_for_clarification:
        context = conversation_manager.question_context
        is_specific, _ = is_specific_content(user_message, context)
        
        if is_specific:
            # 구체적인 답변을 받았으므로 최종 답변 생성
            specific_query = create_specific_query(user_message)
            return specific_query, True
        else:
            # 여전히 구체적이지 않은 답변
            return "더 구체적인 위치를 알려주세요. 위의 옵션 중에서 선택해주시면 됩니다.", False
    
    # 새로운 질문인 경우
    is_specific, question_type = is_specific_content(user_message)
    
    if is_specific:
        # 구체적인 질문이므로 바로 처리
        return user_message, True
    else:
        # 구체적이지 않은 질문이므로 추가 질문 생성
        clarification_question = generate_clarification_question(user_message, question_type)
        return clarification_question, False