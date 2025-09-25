from typing import Dict, List, Tuple, Optional

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

def is_specific_question(user_message: str) -> Tuple[bool, Optional[str]]:
    """
    질문이 구체적인지 판단
    
    Returns:
        Tuple[구체적_여부, 질문_유형]
    """
    
    # 구체적인 질문 패턴들
    specific_patterns = {
        "location_problem": [
            # 위치 + 문제 패턴
            "화장실에서", "부엌에서", "거실에서", "침실에서", "베란다에서",
            "후라이팬에", "인덕션에", "세탁기에", "냉장고에", "에어컨에",
            "벽지에", "바닥에", "천장에", "문에", "창문에",
            "싱크대에", "수도꼭지에", "샤워부스에", "욕조에"
        ],
        "specific_object": [
            # 구체적인 대상
            "후라이팬", "팬", "인덕션", "가스레인지", "전자레인지",
            "세탁기", "냉장고", "에어컨", "보일러", "정수기",
            "화장실 타일", "실리콘", "거울", "유리", "스테인리스"
        ],
        "specific_problem": [
            # 구체적인 문제
            "기름때가", "물때가", "곰팡이가", "녹이", "얼룩이",
            "누수가", "누전이", "단락이", "화재가", "파손이",
            "부식이", "변색이", "탈색이", "찌그러짐이", "찢어짐이"
        ]
    }
    
    # 사용자 메시지에서 구체적인 패턴 찾기
    for pattern_type, patterns in specific_patterns.items():
        for pattern in patterns:
            if pattern in user_message:
                return True, pattern_type
    
    # 일반적인 질문 패턴들 (구체적이지 않음)
    general_patterns = [
        "방법", "어떻게", "해결", "제거", "청소", "정리",
        "기름때", "물때", "곰팡이", "녹", "얼룩"
    ]
    
    # 일반적인 패턴이 있지만 구체적인 위치나 대상이 없는 경우
    has_general = any(pattern in user_message for pattern in general_patterns)
    has_specific = any(pattern in user_message for pattern in specific_patterns["location_problem"] + 
                      specific_patterns["specific_object"] + specific_patterns["specific_problem"])
    
    if has_general and not has_specific:
        return False, "general"
    
    return True, "specific"

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

어떤 공간을 청소하고 싶으신가요?

• 화장실
• 부엌
• 거실
• 침실
• 베란다

구체적인 공간을 알려주시면 더 정확한 방법을 안내해드릴게요!"""

    else:
        conversation_manager.question_context = "general"
        return """더 구체적인 정보가 필요합니다.

어떤 문제가 발생했고, 어디에서 발생했는지 알려주시면 더 정확한 해결책을 제공할 수 있습니다.

예시:
• "화장실에서 곰팡이 제거 방법"
• "후라이팬 기름때 제거 방법"
• "부엌 싱크대 물때 제거 방법"

구체적으로 알려주세요!"""

def is_clarification_answer(user_message: str) -> bool:
    """사용자 답변이 구체적인지 확인"""
    
    if not conversation_manager.waiting_for_clarification:
        return False
    
    context = conversation_manager.question_context
    
    if context == "grease":
        specific_answers = ["후라이팬", "팬", "인덕션", "가스레인지", "벽지", "벽면", "바닥", "옷", "직물"]
    elif context == "mold":
        specific_answers = ["화장실", "타일", "실리콘", "벽지", "벽면", "천장", "옷장", "서랍", "부엌", "싱크대"]
    elif context == "water_stain":
        specific_answers = ["화장실", "거울", "유리", "싱크대", "수도꼭지", "수전", "샤워부스", "욕조", "세탁기"]
    elif context == "rust":
        specific_answers = ["수도꼭지", "파이프", "자전거", "금속", "도구", "공구", "자동차"]
    elif context == "cleaning":
        specific_answers = ["화장실", "부엌", "거실", "침실", "베란다"]
    else:
        return True  # 일반적인 경우는 바로 처리
    
    # 사용자 답변에 구체적인 키워드가 포함되어 있는지 확인
    return any(answer in user_message for answer in specific_answers)

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
        if is_clarification_answer(user_message):
            # 구체적인 답변을 받았으므로 최종 답변 생성
            specific_query = create_specific_query(user_message)
            return specific_query, True
        else:
            # 여전히 구체적이지 않은 답변
            return "더 구체적인 위치를 알려주세요. 위의 옵션 중에서 선택해주시면 됩니다.", False
    
    # 새로운 질문인 경우
    is_specific, question_type = is_specific_question(user_message)
    
    if is_specific:
        # 구체적인 질문이므로 바로 처리
        return user_message, True
    else:
        # 구체적이지 않은 질문이므로 추가 질문 생성
        clarification_question = generate_clarification_question(user_message, question_type)
        return clarification_question, False
