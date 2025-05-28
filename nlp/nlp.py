from nlp.retriever import load_index
from nlp.generator import generate_gpt_answer
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