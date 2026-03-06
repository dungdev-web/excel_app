# 🏢 Company Comparison System

**Nền tảng so sánh công ty thông minh với Hybrid ML Recommendation Engine**

<p align="center">
  <img src="assets/ml-demo.png" alt="Demo" width="800"/>
</p>

![Status](https://img.shields.io/badge/status-active-success)
![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![ML](https://img.shields.io/badge/AI-Hybrid%20ML-purple)
![Python](https://img.shields.io/badge/Python-3.11-blue)
![NestJS](https://img.shields.io/badge/NestJS-10-red)
![Next.js](https://img.shields.io/badge/Next.js-14-black)

---

## Mục Lục

- [Tổng Quan](#-tổng-quan)
- [Tính Năng](#-tính-năng)
- [Kiến Trúc Hệ Thống](#-kiến-trúc-hệ-thống)
- [Hybrid ML Engine](#-hybrid-ml-engine)
- [Cài Đặt](#-cài-đặt)
- [Chạy Hệ Thống](#-chạy-hệ-thống)
- [API Endpoints](#-api-endpoints)
- [Tech Stack](#-tech-stack)
- [Cấu Trúc Thư Mục](#-cấu-trúc-thư-mục)
- [Testing](#-testing)
- [Câu Hỏi Phỏng Vấn](#-câu-hỏi-phỏng-vấn)

---

## Tổng Quan

**Company Comparison System** là ứng dụng web full-stack giúp người dùng so sánh và lựa chọn công ty phù hợp nhất thông qua:

- **Hybrid ML Recommendation** — Kết hợp Content-Based Filtering + Collaborative Filtering (SVD)
- **Real-time Analytics** — Dashboard với view tracking persist qua Excel
- **Salary Benchmarking** — So sánh lương với chuẩn thị trường
- **WebSocket Collaboration** — Cùng so sánh công ty với đồng nghiệp real-time
- **Cold Start Handling** — Alpha tự động điều chỉnh theo lượng history của user

---

## Tính Năng

### 1. Hybrid ML Recommendation *(tính năng chính)*
- **Content-Based Filtering** — Cosine Similarity giữa preference vector và company vector
- **Collaborative Filtering** — Matrix Factorization bằng SVD (User-User)
- **Hybrid Blend** — Alpha tự điều chỉnh: user mới → 100% Content, user cũ → 70% Collaborative
- **Cold Start Problem** solved — fallback tự động khi chưa đủ data
- **ML Score Breakdown** — hiển thị % Content vs % Collaborative cho từng gợi ý
- **Implicit Rating** — tự động convert overallScore → rating (1–5) từ Excel

### 2. Analytics Dashboard
- Top 5 công ty được xem nhiều nhất (persist vào Excel, không mất khi restart)
- View tracking với in-memory cache + auto flush mỗi 10 giây
- Thống kê lương: avg, median, min, max, distribution
- Phân bố theo ngành
- Điểm sức khỏe công ty

### 3. So Sánh Công Ty
- Bảng so sánh chi tiết side-by-side
- Bar Chart & Radar Chart
- Lưu lịch sử so sánh

### 4. Salary Benchmarking
- So sánh với chuẩn thị trường Adecco Vietnam
- Breakdown Junior / Mid / Senior
- Khuyến nghị: Accept / Negotiate / Reject

### 5. 🔄 Real-time Collaboration
- WebSocket (Socket.io)
- Join session bằng ID
- Share comparisons live

---

## 🏗 Kiến Trúc Hệ Thống

```
┌─────────────────┐     REST/WS      ┌─────────────────┐
│  Next.js 14     │ ◄──────────────► │   NestJS        │
│  (Frontend)     │                  │   (Backend)     │
│  :3001          │                  │   :3000         │
└─────────────────┘                  └────────┬────────┘
                                              │ HTTP
                                              ▼
                                     ┌─────────────────┐
                                     │  Python FastAPI  │
                                     │  (ML Service)   │
                                     │  :8000          │
                                     └─────────────────┘
                                              │
                                     ┌────────▼────────┐
                                     │  companies.xlsx  │
                                     │  (Storage)      │
                                     └─────────────────┘
```

### Flow Recommendation

```
User gửi preferences
        │
        ▼
NestJS: buildHistoryFromData()
→ đọc Excel → convert overallScore → rating
        │
        ▼
NestJS: mergeHistory(excelHistory, interactionHistory)
        │
        ▼
Python ML Service /recommend
        │
   ┌────┴────┐
   ▼         ▼
Content   Collaborative
Based     Filtering
(Cosine   (SVD Matrix
Sim.)     Factorization)
   │         │
   └────┬────┘
        ▼
  Hybrid Blend
  α × Content + (1-α) × Collab
  (α tự động theo history count)
        │
        ▼
  Top 3 kết quả + reason
```

---

## Hybrid ML Engine

### Thuật Toán

**1. Content-Based Filtering**
```python
# Cosine Similarity giữa user preference và company vector
user_vec    = [prioritizeSalary, prioritizeBenefits, prioritizeGrowth, prioritizeWorkLife]
company_vec = [norm_salary, benefits, growth, workLifeBalance]
score = cosine_similarity(user_vec, company_vec)
```

**2. Collaborative Filtering (SVD)**
```python
# Matrix Factorization
#          CompA  CompB  CompC
# user1  [  3      3      3  ]
# user2  [  3      1      0  ] ← SVD predict ô = 0
U, sigma, Vt = svds(user_item_matrix, k=10)
predicted = U × diag(sigma) × Vt
```

**3. Hybrid Blend với Dynamic Alpha**
```python
# Alpha tự điều chỉnh theo lượng history
user_history_count = len([h for h in history if h.userId == userId])
alpha = max(0.3, 1.0 - (user_history_count / 20))
# 0  history → alpha = 1.0 (100% Content-Based)
# 10 history → alpha = 0.5 (50/50)
# 20 history → alpha = 0.3 (30% Content, 70% Collaborative)

final_score = alpha × content_score + (1 - alpha) × collaborative_score
```

### Cold Start Problem

| Trường hợp | Collaborative | Alpha | Kết quả |
|---|---|---|---|
| User mới, 0 history | 0% | 1.0 | 100% Content-Based |
| User đã rate hết công ty | 0% | auto | 100% Content-Based |
| User có history, còn công ty chưa xem | >0% | <1.0 | Hybrid |

### Implicit Rating từ Excel

```
overallScore 0–100  →  rating 1–5
score 63            →  rating 3
score 23            →  rating 1
score 69            →  rating 3
```

---

## Cài Đặt

### Prerequisites

```bash
Node.js >= 18
Python >= 3.11   # (3.14 có thể lỗi numpy)
npm >= 9
```

### 1. Clone repo

```bash
git clone https://github.com/dungdev-web/excel_app
cd excel_app
```

### 2. Backend Setup

```bash
cd backend
npm install

# Tạo .env
echo "NODE_ENV=development
PORT=3000
ML_SERVICE_URL=http://localhost:8000
JWT_SECRET=your_secret_here
CORS_ORIGIN=http://localhost:3001" > .env
```

### 3. ML Service Setup

```bash
cd ml-service
python -m pip install -r requirements.txt
```

### 4. Frontend Setup

```bash
cd frontend
npm install

echo "NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000" > .env.local
```

---

## Chạy Hệ Thống

Mở **3 terminal** chạy song song:

```bash
# Terminal 1 — ML Service
cd ml-service
python -m uvicorn main:app --reload --port 8000
# → http://localhost:8000/docs (Swagger UI)

# Terminal 2 — Backend
cd backend
npm run start:dev
# → http://localhost:3000

# Terminal 3 — Frontend
cd frontend
npm run dev
# → http://localhost:3001
```

### Kiểm tra ML Service

```bash
curl http://localhost:8000/health
# → {"status":"ok","service":"ML Recommendation"}
```

---

## 🔌 API Endpoints

### Companies
```bash
GET    /api/companies              # Lấy danh sách (filter theo user)
POST   /api/companies              # Thêm công ty
GET    /api/companies/:id          # Chi tiết
PUT    /api/companies/:id          # Cập nhật
DELETE /api/companies/:id          # Xóa
```

### AI Recommendations
```bash
POST /api/ai/recommend             # Hybrid ML recommendation
POST /api/ai/top3                  # Top 3 gợi ý
POST /api/ai/insight               # Phân tích tổng quan
POST /api/ai/track                 # Track hành vi (view/compare/save)
```

**Request body `/api/ai/recommend`:**
```json
{
  "prioritizeSalary": 8,
  "prioritizeBenefits": 6,
  "prioritizeGrowth": 7,
  "prioritizeWorkLifeBalance": 5,
  "minSalary": 3000,
  "maxSalary": 10000
}
```

**Response:**
```json
[{
  "company": { "name": "Google", "salary": 8000 },
  "score": 99.0,
  "matchPercentage": 99,
  "reason": "Google phù hợp với bạn vì mức lương $8,000 cạnh tranh.",
  "contentScore": 0.986,
  "collaborativeScore": 0.5,
  "usedML": true
}]
```

### Analytics
```bash
GET  /api/analytics/dashboard             # Dashboard metrics
GET  /api/analytics/salary-stats          # Thống kê lương
GET  /api/analytics/company-health/:id    # Health score
POST /api/analytics/track-view/:id        # Track view (persist Excel)
```

### ML Service (Python)
```bash
POST /recommend    # Hybrid recommendation
GET  /health       # Health check
GET  /docs         # Swagger UI
```

---

## Tech Stack

| Layer | Technology | Mục đích |
|---|---|---|
| Frontend | Next.js 14, React 18 | UI |
| Styling | Tailwind CSS | Design |
| Backend | NestJS, TypeScript | REST API + WebSocket |
| ML Service | Python FastAPI | Hybrid ML Algorithm |
| Algorithm | scikit-learn, scipy, numpy | Cosine Sim + SVD |
| Storage | Excel (ExcelJS) | Persist data |
| Real-time | Socket.io | Collaboration |
| Charts | Chart.js, Recharts | Visualization |
| Auth | JWT | Authentication |

---

## 📁 Cấu Trúc Thư Mục

```
excel_app/
├── backend/
│   └── src/
│       ├── companies/
│       │   ├── companies.service.ts     # Excel CRUD + viewCount
│       │   └── companies.controller.ts
│       ├── ai/
│       │   ├── ai.service.ts            # Hybrid ML + fallback
│       │   └── ai.controller.ts         # + /track endpoint
│       ├── analytics/
│       │   ├── analytics.service.ts     # View cache + flush
│       │   └── analytics.controller.ts
│       └── comparisons/
│
├── frontend/
│   └── src/app/
│       ├── component/
│       │   ├── AIRecommendations.tsx    # ML badge + breakdown
│       │   ├── CompanyListAdvanced.tsx  # Click → TrackView
│       │   └── AnalyticsDashboard.tsx
│       └── lib/
│           └── api.ts                   # TrackView, TrackAI
│
└── ml-service/                          # Python ML Service
    ├── main.py                          # FastAPI + Hybrid algo
    ├── requirements.txt
    ├── Dockerfile
    └── tests/
        └── test_recommend.py            # 14 unit tests
```

---

## Testing

```bash
cd ml-service

# Chạy toàn bộ test
python -m pytest tests/test_recommend.py -v

# Kết quả mong đợi:
# test_content_based_returns_all_companies    PASSED
# test_content_based_salary_priority         PASSED
# test_collaborative_returns_empty_for_new   PASSED
# test_hybrid_top1_is_google_for_salary      PASSED
# ... 14 passed
```

---
