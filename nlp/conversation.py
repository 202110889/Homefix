from typing import Dict, List, Optional, Tuple
import json
from datetime import datetime

class ConversationState:
    """대화 상태를 관리하는 클래스"""
    
    def __init__(self):
        self.current_context = None  # 현재 질문의 맥락
        self.pending_questions = []   # 대기 중인 추가 질문들
        self.collected_info = {}     # 수집된 정보
        self.conversation_stage = "initial"  # initial, collecting, answering
        self.last_question_type = None
        
    def reset(self):
        """대화 상태 초기화"""
        self.current_context = None
        self.pending_questions = []
        self.collected_info = {}
        self.conversation_stage = "initial"
        self.last_question_type = None

# 전역 대화 상태 관리자
conversation_manager = ConversationState()

def analyze_question_context(user_message: str) -> Tuple[str, List[str], Dict[str, str]]:
    """
    질문의 맥락을 분석하고 필요한 추가 정보를 결정
    
    Returns:
        Tuple[질문_유형, 추가_질문_리스트, 기본_정보]
    """
    
    # 기름때 관련 질문
    if "기름때" in user_message:
        return (
            "oil_stain",
            [
                "어디에서 기름때를 제거하고 싶으신가요?",
                "구체적인 위치를 알려주세요:"
            ],
            {
                "options": [
                    "후라이팬/팬",
                    "인덕션/가스레인지", 
                    "벽지/벽면",
                    "바닥",
                    "옷/직물",
                    "기타"
                ],
                "context": "기름때 제거"
            }
        )
    
    # 곰팡이 관련 질문
    if "곰팡이" in user_message:
        return (
            "mold",
            [
                "어디에 곰팡이가 생겼나요?",
                "구체적인 위치를 알려주세요:"
            ],
            {
                "options": [
                    "화장실 타일/실리콘",
                    "벽지/벽면",
                    "천장",
                    "옷장/서랍",
                    "부엌 싱크대",
                    "기타"
                ],
                "context": "곰팡이 제거"
            }
        )
    
    # 물때 관련 질문
    if "물때" in user_message:
        return (
            "water_stain",
            [
                "어디에서 물때를 제거하고 싶으신가요?",
                "구체적인 위치를 알려주세요:"
            ],
            {
                "options": [
                    "화장실 거울/유리",
                    "싱크대/수도꼭지",
                    "샤워부스/욕조",
                    "세탁기",
                    "기타"
                ],
                "context": "물때 제거"
            }
        )
    
    # 녹 관련 질문
    if "녹" in user_message:
        return (
            "rust",
            [
                "어디에서 녹을 제거하고 싶으신가요?",
                "구체적인 위치를 알려주세요:"
            ],
            {
                "options": [
                    "수도꼭지/파이프",
                    "자전거/금속제품",
                    "도구/공구",
                    "자동차",
                    "기타"
                ],
                "context": "녹 제거"
            }
        )
    
    # 청소 관련 일반 질문
    if any(keyword in user_message for keyword in ["청소", "정리", "세척"]):
        return (
            "cleaning",
            [
                "어떤 것을 청소하고 싶으신가요?",
                "구체적인 대상을 알려주세요:"
            ],
            {
                "options": [
                    "화장실",
                    "부엌",
                    "거실",
                    "침실",
                    "베란다",
                    "기타"
                ],
                "context": "청소"
            }
        )
    
    # 기본 질문 (추가 정보 불필요)
    return ("general", [], {})

def generate_contextual_question(question_type: str, context_info: Dict[str, str]) -> str:
    """맥락에 맞는 질문 생성"""
    
    if question_type == "oil_stain":
        options = context_info['options']
        return f"""기름때 제거는 대상에 따라 방법이 다릅니다. 

어디에서 기름때를 제거하고 싶으신가요?:
• {options[0]}
• {options[1]}
• {options[2]}
• {options[3]}
• {options[4]}
• {options[5]}

구체적인 위치를 알려주시면 더 정확한 방법을 안내해드릴게요!"""
    
    elif question_type == "mold":
        options = context_info['options']
        return f"""곰팡이 제거는 발생 위치에 따라 방법이 다릅니다.

어디에 곰팡이가 생겼나요?:
• {options[0]}
• {options[1]}
• {options[2]}
• {options[3]}
• {options[4]}
• {options[5]}

구체적인 위치를 알려주시면 더 정확한 방법을 안내해드릴게요!"""
    
    elif question_type == "water_stain":
        options = context_info['options']
        return f"""물때 제거는 표면에 따라 방법이 다릅니다.

어디에서 물때를 제거하고 싶으신가요?:
• {options[0]}
• {options[1]}
• {options[2]}
• {options[3]}
• {options[4]}
• {options[5]}

구체적인 위치를 알려주시면 더 정확한 방법을 안내해드릴게요!"""
    
    elif question_type == "rust":
        options = context_info['options']
        return f"""녹 제거는 재질과 상태에 따라 방법이 다릅니다.

어디에서 녹을 제거하고 싶으신가요?:
• {options[0]}
• {options[1]}
• {options[2]}
• {options[3]}
• {options[4]}
• {options[5]}

구체적인 위치를 알려주시면 더 정확한 방법을 안내해드릴게요!"""
    
    elif question_type == "cleaning":
        options = context_info['options']
        return f"""청소는 공간에 따라 방법이 다릅니다.

어떤 공간을 청소하고 싶으신가요?:
• {options[0]}
• {options[1]}
• {options[2]}
• {options[3]}
• {options[4]}
• {options[5]}

구체적인 공간을 알려주시면 더 정확한 방법을 안내해드릴게요!"""
    
    return "더 구체적인 정보가 필요합니다."

def is_specific_answer(user_message: str, question_type: str) -> bool:
    """사용자 답변이 구체적인지 확인"""
    
    # 옵션 리스트에서 선택했는지 확인
    if question_type == "oil_stain":
        options = ["후라이팬", "팬", "인덕션", "가스레인지", "벽지", "벽면", "바닥", "옷", "직물"]
    elif question_type == "mold":
        options = ["화장실", "타일", "실리콘", "벽지", "벽면", "천장", "옷장", "서랍", "부엌", "싱크대"]
    elif question_type == "water_stain":
        options = ["화장실", "거울", "유리", "싱크대", "수도꼭지", "샤워부스", "욕조", "세탁기"]
    elif question_type == "rust":
        options = ["수도꼭지", "파이프", "자전거", "금속", "도구", "공구", "자동차"]
    elif question_type == "cleaning":
        options = ["화장실", "부엌", "거실", "침실", "베란다"]
    else:
        return True  # 일반 질문은 바로 답변
    
    # 사용자 메시지에 옵션 중 하나가 포함되어 있는지 확인
    return any(option in user_message for option in options)

def process_conversation(user_message: str) -> Tuple[str, bool]:
    """
    대화를 처리하고 응답을 생성
    
    Returns:
        Tuple[응답_메시지, 대화_완료_여부]
    """
    
    # 현재 대화 상태 확인
    if conversation_manager.conversation_stage == "collecting":
        # 추가 정보 수집 중
        if is_specific_answer(user_message, conversation_manager.last_question_type):
            # 구체적인 답변을 받았으므로 최종 답변 생성
            conversation_manager.collected_info["location"] = user_message
            conversation_manager.conversation_stage = "answering"
            return generate_final_answer(), True
        else:
            # 여전히 구체적이지 않은 답변
            return "더 구체적인 위치를 알려주세요. 위의 옵션 중에서 선택해주시면 됩니다.", False
    
    else:
        # 새로운 질문 시작
        question_type, questions, context_info = analyze_question_context(user_message)
        
        if question_type == "general":
            # 일반 질문은 바로 처리
            conversation_manager.reset()
            return "", True  # 기존 로직으로 처리
        
        else:
            # 구체적인 정보가 필요한 질문
            conversation_manager.current_context = question_type
            conversation_manager.last_question_type = question_type
            conversation_manager.conversation_stage = "collecting"
            
            contextual_question = generate_contextual_question(question_type, context_info)
            return contextual_question, False

def generate_final_answer() -> str:
    """수집된 정보를 바탕으로 최종 답변 생성"""
    
    context = conversation_manager.current_context
    location = conversation_manager.collected_info.get("location", "")
    
    # 대화 상태 초기화
    conversation_manager.reset()
    
    # 구체적인 검색 쿼리 생성
    if context == "oil_stain":
        search_query = f"{location}에서 기름때 제거하는 방법"
    elif context == "mold":
        search_query = f"{location}에서 곰팡이 제거하는 방법"
    elif context == "water_stain":
        search_query = f"{location}에서 물때 제거하는 방법"
    elif context == "rust":
        search_query = f"{location}에서 녹 제거하는 방법"
    elif context == "cleaning":
        search_query = f"{location} 청소하는 방법"
    else:
        search_query = f"{location} 관련 해결책"
    
    return search_query  # 이 쿼리로 FAISS 검색 수행
