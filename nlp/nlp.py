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
    
    # 모든 질문에 대해 임베딩과 FAISS 검색 사용
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
    
    # GPT로 응답 생성
    answer = generate_gpt_answer(search_query, final_context)
    return answer