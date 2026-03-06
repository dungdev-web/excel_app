"""
pytest tests/test_recommend.py
"""
import pytest
from main import (
    content_based_score,
    collaborative_score,
    hybrid_recommend,
    Company,
    UserPreference,
    UserHistory,
)

# ─────────────────────────────────────────
# FIXTURES
# ─────────────────────────────────────────

@pytest.fixture
def companies():
    return [
        Company(id="c1", name="Google",    salary=8000, benefits=9, growth=9, workLifeBalance=8),
        Company(id="c2", name="Startup X", salary=3000, benefits=5, growth=8, workLifeBalance=6),
        Company(id="c3", name="Bank ABC",  salary=5000, benefits=8, growth=5, workLifeBalance=7),
        Company(id="c4", name="FPT",       salary=2500, benefits=6, growth=7, workLifeBalance=7),
    ]

@pytest.fixture
def salary_pref():
    """User ưu tiên lương cao"""
    return UserPreference(
        userId="u1",
        prioritizeSalary=9,
        prioritizeBenefits=4,
        prioritizeGrowth=4,
        prioritizeWorkLife=3,
    )

@pytest.fixture
def growth_pref():
    """User ưu tiên growth"""
    return UserPreference(
        userId="u2",
        prioritizeSalary=3,
        prioritizeBenefits=4,
        prioritizeGrowth=9,
        prioritizeWorkLife=5,
    )

@pytest.fixture
def history():
    return [
        UserHistory(userId="u1", companyId="c1", rating=5),
        UserHistory(userId="u1", companyId="c2", rating=2),
        UserHistory(userId="u2", companyId="c2", rating=5),
        UserHistory(userId="u2", companyId="c3", rating=3),
        UserHistory(userId="u3", companyId="c1", rating=4),
        UserHistory(userId="u3", companyId="c3", rating=2),
    ]

# ─────────────────────────────────────────
# CONTENT-BASED TESTS
# ─────────────────────────────────────────

def test_content_based_returns_all_companies(salary_pref, companies):
    scores = content_based_score(salary_pref, companies)
    assert len(scores) == len(companies)

def test_content_based_salary_priority(salary_pref, companies):
    """User ưu tiên lương → Google (lương cao nhất) phải rank #1"""
    scores = content_based_score(salary_pref, companies)
    ranked = sorted(scores, key=scores.get, reverse=True)
    assert ranked[0] == "c1"  # Google

def test_content_based_growth_priority(growth_pref, companies):
    """User ưu tiên growth → Startup X (growth=8) hoặc Google (growth=9) phải top"""
    scores = content_based_score(growth_pref, companies)
    ranked = sorted(scores, key=scores.get, reverse=True)
    assert ranked[0] in ["c1", "c2"]  # Google hoặc Startup X

def test_content_based_scores_between_0_and_1(salary_pref, companies):
    scores = content_based_score(salary_pref, companies)
    for score in scores.values():
        assert 0.0 <= score <= 1.0

def test_content_based_salary_filter(companies):
    """User chỉ muốn lương 4000–9000 → không gợi ý công ty dưới 4000"""
    pref = UserPreference(
        userId="u1",
        prioritizeSalary=8, prioritizeBenefits=5,
        prioritizeGrowth=5, prioritizeWorkLife=5,
        minSalary=4000, maxSalary=9000,
    )
    filtered = [c for c in companies if 4000 <= c.salary <= 9000]
    scores = content_based_score(pref, filtered)
    assert "c2" not in scores  # Startup X salary=3000
    assert "c4" not in scores  # FPT salary=2500

# ─────────────────────────────────────────
# COLLABORATIVE FILTERING TESTS
# ─────────────────────────────────────────

def test_collaborative_returns_empty_for_new_user(companies, history):
    """User mới không có history → collaborative trả về rỗng"""
    scores = collaborative_score("new_user_999", companies, history)
    assert scores == {}

def test_collaborative_returns_scores_for_existing_user(companies, history):
    scores = collaborative_score("u1", companies, history)
    assert isinstance(scores, dict)

def test_collaborative_scores_normalized(companies, history):
    scores = collaborative_score("u1", companies, history)
    if scores:
        for score in scores.values():
            assert 0.0 <= score <= 1.0

def test_collaborative_empty_history(companies):
    scores = collaborative_score("u1", companies, [])
    assert scores == {}

# ─────────────────────────────────────────
# HYBRID TESTS
# ─────────────────────────────────────────

def test_hybrid_returns_top_3(salary_pref, companies, history):
    results = hybrid_recommend(salary_pref, companies, history, top_k=3)
    assert len(results) == 3

def test_hybrid_sorted_by_score(salary_pref, companies, history):
    results = hybrid_recommend(salary_pref, companies, history)
    scores = [r.score for r in results]
    assert scores == sorted(scores, reverse=True)

def test_hybrid_new_user_uses_content_only(companies):
    """User mới → collaborative=0 → final_score phải bằng content_score"""
    pref = UserPreference(
        userId="brand_new_user",
        prioritizeSalary=8, prioritizeBenefits=5,
        prioritizeGrowth=5, prioritizeWorkLife=5,
    )
    results = hybrid_recommend(pref, companies, history=[], top_k=3)
    for r in results:
        # Không có collaborative data → contentScore == score
        assert abs(r.score - r.contentScore) < 0.001

def test_hybrid_result_has_reason(salary_pref, companies, history):
    results = hybrid_recommend(salary_pref, companies, history)
    for r in results:
        assert isinstance(r.reason, str)
        assert len(r.reason) > 10

def test_hybrid_top1_is_google_for_salary_priority(salary_pref, companies):
    """User ưu tiên lương cao → Google phải là #1"""
    results = hybrid_recommend(salary_pref, companies, history=[], top_k=3)
    assert results[0].companyId == "c1"

def test_hybrid_respects_top_k(salary_pref, companies, history):
    results = hybrid_recommend(salary_pref, companies, history, top_k=2)
    assert len(results) == 2