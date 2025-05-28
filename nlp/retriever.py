import re
import faiss
import numpy as np
from sklearn.preprocessing import normalize
from sentence_transformers import SentenceTransformer

# 🔍 문서에서 "## 문제:" 항목만 추출
def extract_problem_only(docs):
    problems = []
    for doc in docs:
        match = re.search(r"## 문제[:：](.+)", doc)
        problems.append(match.group(1).strip() if match else "")
    return problems

def load_index(md_path="homefix.md"):
    with open(md_path, "r", encoding="utf-8") as f:
        markdown_text = f.read()

    sections = markdown_text.split("\n---\n")
    docs = [section.strip() for section in sections if section.strip()]

    retriever = SentenceTransformer("jhgan/ko-sroberta-multitask")

    problem_texts = extract_problem_only(docs)
    problem_embeddings = retriever.encode(problem_texts, convert_to_tensor=False)
    problem_embeddings = np.array(problem_embeddings).astype("float32")
    problem_embeddings = normalize(problem_embeddings, norm='l2')

    dim = problem_embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(problem_embeddings)

    return retriever, index, docs, problem_texts