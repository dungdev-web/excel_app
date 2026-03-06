from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
from scipy.sparse.linalg import svds
import pandas as pd
import uvicorn

app = FastAPI(title="ML Recommendation Service")

# ─────────────────────────────────────────
# SCHEMAS
# ─────────────────────────────────────────

class Company(BaseModel):
    id: str
    name: str
    salary: float        # 0–10000 USD
    benefits: float      # 0–10
    growth: float        # 0–10
    workLifeBalance: float  # 0–10
    industry: Optional[str] = "IT"

class UserPreference(BaseModel):
    userId: str
    prioritizeSalary: float       # 0–10
    prioritizeBenefits: float     # 0–10
    prioritizeGrowth: float       # 0–10
    prioritizeWorkLife: float     # 0–10
    minSalary: Optional[float] = 0
    maxSalary: Optional[float] = 99999

class UserHistory(BaseModel):
    userId: str
    companyId: str
    rating: float   # 1–5 (implicit: views=1, compare=3, saved=5)

class RecommendRequest(BaseModel):
    preference: UserPreference
    companies: List[Company]
    history: Optional[List[UserHistory]] = []   # lịch sử tất cả users

class RecommendResult(BaseModel):
    companyId: str
    companyName: str
    score: float
    contentScore: float
    collaborativeScore: float
    reason: str

# ─────────────────────────────────────────
# 1. CONTENT-BASED FILTERING
# ─────────────────────────────────────────

def normalize_salary(salary: float, min_s: float, max_s: float) -> float:
    """Normalize salary về thang 0–10"""
    if max_s == min_s:
        return 5.0
    return (salary - min_s) / (max_s - min_s) * 10

def content_based_score(
    preference: UserPreference,
    companies: List[Company]
) -> dict[str, float]:
    """
    Cosine similarity giữa preference vector và company vector.
    Trả về dict: companyId → score (0–1)
    """
    if not companies:
        return {}

    salaries = [c.salary for c in companies]
    min_s, max_s = min(salaries), max(salaries)

    # Vector của user preference (đã chuẩn hóa về 0–10)
    user_vec = np.array([[
        preference.prioritizeSalary,
        preference.prioritizeBenefits,
        preference.prioritizeGrowth,
        preference.prioritizeWorkLife,
    ]])

    scores = {}
    for company in companies:
        norm_salary = normalize_salary(company.salary, min_s, max_s)

        # Vector của công ty, scale theo preference weight
        company_vec = np.array([[
            norm_salary * (preference.prioritizeSalary / 10),
            company.benefits * (preference.prioritizeBenefits / 10),
            company.growth * (preference.prioritizeGrowth / 10),
            company.workLifeBalance * (preference.prioritizeWorkLife / 10),
        ]])

        sim = cosine_similarity(user_vec, company_vec)[0][0]
        scores[company.id] = float(np.clip(sim, 0, 1))

    return scores

# ─────────────────────────────────────────
# 2. COLLABORATIVE FILTERING (SVD)
# ─────────────────────────────────────────

def collaborative_score(
    current_user_id: str,
    companies: List[Company],
    history: List[UserHistory]
) -> dict[str, float]:
    """
    Matrix Factorization bằng SVD.
    User–Item matrix → SVD → predict rating cho current user.
    Trả về dict: companyId → predicted score (0–1)
    """
    if not history:
        return {}

    company_ids = [c.id for c in companies]
    user_ids = list({h.userId for h in history})

    # Cần ít nhất 2 users và 2 companies để SVD hoạt động
    if len(user_ids) < 2 or len(company_ids) < 2:
        return {}

    # Build user–item matrix
    df = pd.DataFrame(0.0, index=user_ids, columns=company_ids)
    for h in history:
        if h.userId in df.index and h.companyId in df.columns:
            df.loc[h.userId, h.companyId] = h.rating

    matrix = df.values.astype(float)

    # SVD decomposition
    k = min(min(matrix.shape) - 1, 10)  # số latent factors
    if k < 1:
        return {}

    try:
        U, sigma, Vt = svds(matrix, k=k)
        predicted = np.dot(np.dot(U, np.diag(sigma)), Vt)
        predicted_df = pd.DataFrame(predicted, index=user_ids, columns=company_ids)
    except Exception:
        return {}

    if current_user_id not in predicted_df.index:
        # User mới chưa có history → trả về empty để fallback Content-Based
        return {}

    user_predictions = predicted_df.loc[current_user_id]

    # Normalize về 0–1
    min_val, max_val = user_predictions.min(), user_predictions.max()
    if max_val == min_val:
        return {cid: 0.5 for cid in company_ids}

    scores = {}
    for cid in company_ids:
        raw = user_predictions[cid] if cid in user_predictions else 0
        scores[cid] = float((raw - min_val) / (max_val - min_val))

    return scores

# ─────────────────────────────────────────
# 3. HYBRID BLEND
# ─────────────────────────────────────────

def hybrid_recommend(
    preference: UserPreference,
    companies: List[Company],
    history: List[UserHistory],
    top_k: int = 3
) -> List[RecommendResult]:
    """
    Hybrid = α * ContentScore + (1-α) * CollaborativeScore
    α tự động điều chỉnh theo lượng history của user:
      - User mới (0 history)   → α = 1.0 (100% Content-Based)
      - User có nhiều history  → α = 0.3 (30% Content, 70% Collaborative)
    """
    # Lọc theo salary range
    filtered = [
        c for c in companies
        if preference.minSalary <= c.salary <= preference.maxSalary
    ]
    if not filtered:
        filtered = companies

    # Tính scores
    content_scores = content_based_score(preference, filtered)
    collab_scores = collaborative_score(preference.userId, filtered, history)

    # Tính alpha dựa trên lịch sử của user hiện tại
    user_history_count = sum(1 for h in history if h.userId == preference.userId)
    alpha = max(0.3, 1.0 - (user_history_count / 20))  # giảm dần từ 1.0 → 0.3

    results = []
    for company in filtered:
        cid = company.id
        c_score = content_scores.get(cid, 0.0)
        cf_score = collab_scores.get(cid, 0.0)

        # Nếu không có collaborative data → dùng 100% content
        if not collab_scores:
            final_score = c_score
            alpha_used = 1.0
        else:
            alpha_used = alpha
            final_score = alpha_used * c_score + (1 - alpha_used) * cf_score

        # Generate reason
        reason = generate_reason(company, preference, c_score, cf_score, alpha_used)

        results.append(RecommendResult(
            companyId=cid,
            companyName=company.name,
            score=round(final_score, 4),
            contentScore=round(c_score, 4),
            collaborativeScore=round(cf_score, 4),
            reason=reason
        ))

    # Sort và lấy top K
    results.sort(key=lambda x: x.score, reverse=True)
    return results[:top_k]

def generate_reason(
    company: Company,
    pref: UserPreference,
    c_score: float,
    cf_score: float,
    alpha: float
) -> str:
    """Tạo giải thích tự động cho recommendation"""
    highlights = []

    if pref.prioritizeSalary >= 7 and company.salary >= 4000:
        highlights.append(f"mức lương ${company.salary:,.0f} cạnh tranh")
    if pref.prioritizeBenefits >= 7 and company.benefits >= 7:
        highlights.append(f"phúc lợi tốt ({company.benefits}/10)")
    if pref.prioritizeGrowth >= 7 and company.growth >= 7:
        highlights.append(f"cơ hội phát triển cao ({company.growth}/10)")
    if pref.prioritizeWorkLife >= 7 and company.workLifeBalance >= 7:
        highlights.append(f"work-life balance tốt ({company.workLifeBalance}/10)")

    base = f"{company.name} phù hợp với bạn"
    if highlights:
        base += " vì " + ", ".join(highlights)

    if alpha < 0.6 and cf_score > 0.6:
        base += ". Các user có profile tương tự cũng đánh giá cao công ty này"

    return base + "."

# ─────────────────────────────────────────
# API ENDPOINTS
# ─────────────────────────────────────────

@app.post("/recommend", response_model=List[RecommendResult])
async def recommend(req: RecommendRequest):
    """Hybrid recommendation endpoint"""
    if not req.companies:
        raise HTTPException(status_code=400, detail="Cần ít nhất 1 công ty")

    results = hybrid_recommend(
        preference=req.preference,
        companies=req.companies,
        history=req.history or [],
        top_k=3
    )
    return results

@app.get("/health")
async def health():
    return {"status": "ok", "service": "ML Recommendation"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)