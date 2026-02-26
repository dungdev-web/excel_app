# 💼 Company Comparison System

**Một nền tảng toàn diện để so sánh công ty, phân tích lương và hợp tác theo thời gian thực**

![Status](https://img.shields.io/badge/status-active-success)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Mục Lục

- [🎯 Tổng Quan](#-tổng-quan)
- [✨ Tính Năng](#-tính-năng)
- [🏗️ Kiến Trúc](#-kiến-trúc)
- [🚀 Cài Đặt](#-cài-đặt)
- [💻 Sử Dụng](#-sử-dụng)
- [🔌 API Endpoints](#-api-endpoints)
- [🎣 Custom Hooks](#-custom-hooks)
- [📊 Tech Stack](#-tech-stack)
- [📁 Cấu Trúc Thư Mục](#-cấu-trúc-thư-mục)
- [🔧 Cấu Hình](#-cấu-hình)
- [🐛 Troubleshooting](#-troubleshooting)
- [📚 Tài Liệu Thêm](#-tài-liệu-thêm)

---

## 🎯 Tổng Quan

**Company Comparison System** là một ứng dụng web full-stack giúp người dùng:

✅ **So sánh công ty** - Hiển thị dữ liệu song song với bảng & biểu đồ  
✅ **Nhận gợi ý từ AI** - Thuật toán weighted scoring tìm công ty phù hợp  
✅ **Phân tích lương** - So sánh mức lương với tiêu chuẩn thị trường (Adecco Vietnam)  
✅ **Xem analytics** - Dashboard thời gian thực về công ty & so sánh  
✅ **Hợp tác real-time** - WebSocket để cùng so sánh với đồng nghiệp  

---

## ✨ Tính Năng

### 1. 📋 So Sánh Công Ty
- Bảng so sánh chi tiết (lương, phúc lợi, phát triển, cân bằng)
- Xem kết quả thắng/thua
- Lưu lịch sử so sánh

### 2. 📊 Visualizations
- **Bar Chart** - So sánh điểm số
- **Radar Chart** - Phân tích đa chiều
- Responsive design trên mọi màn hình

### 3. 🤖 AI Recommendations
- Weighted scoring algorithm (không cần API)
- Gợi ý top 3 công ty phù hợp
- Xếp hạng dựa trên ưu tiên người dùng
- Lưu lịch sử gợi ý

### 4. 📊 Analytics Dashboard
- Tổng số công ty & so sánh
- Top 5 công ty được xem nhiều nhất
- Thống kê lương (avg, median, min, max)
- Phân bố theo ngành
- Điểm số sức khỏe công ty

### 5. 💰 Salary Benchmarking
- So sánh lương với chuẩn thị trường
- Dữ liệu từ Adecco Vietnam
- Breakdown theo cấp độ (Junior, Mid, Senior)
- Recommendation (Accept/Negotiate/Reject)

### 6. 🔄 Real-time Collaboration
- WebSocket-based communication
- Join sessions bằng ID
- Chia sẻ comparisons live
- Danh sách user hoạt động

---

## 🏗️ Kiến Trúc

### Stack

```
Frontend (Next.js 14)
├── React 18 (Hooks, State Management)
├── Tailwind CSS (Styling)
├── Socket.io Client (Real-time)
├── Chart.js & Recharts (Visualizations)
└── Apollo Client (GraphQL - Optional)

Backend (NestJS)
├── Controllers (REST API)
├── Services (Business Logic)
├── Gateways (WebSocket)
├── Modules (Feature Organization)
└── Excel/JSON Storage

Database (Optional)
├── PostgreSQL (với Hasura)
├── SQLite (Development)
└── Excel (Current)

External APIs
├── Adecco Vietnam (Salary Data)
└── Chart.js (Visualizations)
```

### Kiến Trúc Component

```
Page (6 Tabs)
├── Tab 1: So Sánh
│   ├── CompanyForm (Thêm công ty)
│   ├── CompanySelector (Chọn 2 công ty)
│   ├── CompanyList (Danh sách)
│   └── ComparisonTable (Kết quả)
├── Tab 2: Biểu Đồ
│   └── ComparisonChart (Charts)
├── Tab 3: AI Gợi Ý
│   └── AIRecommendations (Gợi ý)
├── Tab 4: Analytics
│   └── AnalyticsDashboard (Metrics)
├── Tab 5: Lương
│   └── SalaryComparison (Benchmark)
└── Tab 6: Hợp Tác
    └── RealtimeCollaboration (WebSocket)
```

---

## 🚀 Cài Đặt

### Prerequisites

```bash
Node.js >= 18
npm >= 9
Docker (optional, for PostgreSQL)
```

### Backend Setup

```bash
# 1. Clone repo
git clone <repo-url>
cd excel_app/backend

# 2. Install dependencies
npm install

# 3. Cài WebSocket packages
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io

# 4. Create .env
cat > .env << 'DOTENV'
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/excel_app
ADECCO_API_KEY=optional_key
DOTENV

# 5. Start server
npm run start:dev
# Server chạy tại: http://localhost:3000
```

### Frontend Setup

```bash
# 1. Vào thư mục frontend
cd ../frontend

# 2. Install dependencies
npm install

# 3. Install additional packages
npm install socket.io-client chart.js recharts

# 4. Start development
npm run dev
# Frontend chạy tại: http://localhost:3001
```

### (Optional) Database Setup

```bash
# Start PostgreSQL with Docker
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -e POSTGRES_DB=excel_app \
  -p 5432:5432 \
  postgres:14

# Setup Hasura (Real-time GraphQL)
docker run -d \
  --name hasura \
  -p 8080:8080 \
  -e HASURA_GRAPHQL_DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/excel_app \
  -e HASURA_GRAPHQL_ADMIN_SECRET=hasura_secret \
  hasura/graphql-engine:latest

# Access Hasura: http://localhost:8080
```

---

## 💻 Sử Dụng

### 1. Thêm Công Ty

```
1. Nhập thông tin công ty (tên, ngành, lương, phúc lợi, v.v.)
2. Click "Thêm Công Ty"
3. Công ty xuất hiện trong danh sách
```

### 2. So Sánh Công Ty

```
1. Chọn 2 công ty từ dropdown
2. Click "⚖️ So sánh"
3. Xem bảng & biểu đồ so sánh
```

### 3. Nhận AI Gợi Ý

```
1. Đi đến tab "🤖 AI Gợi Ý"
2. Điều chỉnh ưu tiên (Lương, Phúc lợi, Phát triển, Cân bằng)
3. Xem top 3 gợi ý + chi tiết
```

### 4. Xem Analytics

```
1. Đi đến tab "📊 Analytics"
2. Xem:
   - Tổng số công ty & so sánh
   - Top 5 công ty được xem
   - Thống kê lương
   - Phân bố ngành
```

### 5. So Sánh Lương

```
1. Đi đến tab "💰 Salary"
2. Nhập role, ngành, lương của bạn
3. Xem so sánh với chuẩn thị trường:
   - Phần trăm chênh lệch
   - Mức junior/mid/senior
   - Khuyến nghị (Accept/Negotiate/Reject)
```

### 6. Hợp Tác Real-time

```
1. Đi đến tab "🔄 Collaboration"
2. Tạo hoặc join session bằng ID
3. Share comparisons với đồng nghiệp
4. Xem danh sách user hoạt động
```

---

## 🔌 API Endpoints

### Companies

```bash
# Get all companies
GET /api/companies

# Add new company
POST /api/companies
{
  "name": "Google Vietnam",
  "industry": "IT",
  "salary": 5500,
  "benefits": 9,
  "growth": 9,
  "workLifeBalance": 8
}

# Get single company
GET /api/companies/:id

# Update company
PUT /api/companies/:id

# Delete company
DELETE /api/companies/:id
```

### Comparisons

```bash
# Compare 2 companies
POST /api/comparisons
{
  "company1Id": "uuid1",
  "company2Id": "uuid2"
}

# Get all comparisons
GET /api/comparisons

# Get single comparison
GET /api/comparisons/:id
```

### AI Recommendations

```bash
# Get recommendations
POST /api/ai/recommend
{
  "prioritizeSalary": 8,
  "prioritizeGrowth": 7,
  "prioritizeBenefits": 6,
  "prioritizeWorkLifeBalance": 5,
  "minSalary": 3000,
  "maxSalary": 10000
}

# Get top 3
POST /api/ai/top3
{
  "preferences": {...}
}

# Get insight
POST /api/ai/insight
{
  "preferences": {...}
}
```

### Analytics

```bash
# Dashboard metrics
GET /api/analytics/dashboard

# Salary statistics
GET /api/analytics/salary-stats

# Company health score
GET /api/analytics/company-health/:companyId

# Track view
POST /api/analytics/track-view/:companyId
```

### Salary Benchmarking

```bash
# Get benchmark
GET /api/benchmark/:industry/:location

# Compare salary
POST /api/benchmark/compare
{
  "salary": 5500,
  "role": "Software Developer",
  "industry": "IT"
}

# Get salary trends
GET /api/benchmark/trend/:industry
```

### WebSocket Events

```typescript
// Join session
socket.emit('joinSession', { sessionId, userName })

// Select company
socket.emit('selectCompany', { sessionId, company })

// Share comparison
socket.emit('shareComparison', { sessionId, comparison })

// Listen for events
socket.on('userJoined', (data) => {...})
socket.on('userLeft', (data) => {...})
socket.on('companySelected', (data) => {...})
socket.on('comparisonShared', (data) => {...})
```

---

## 🎣 Custom Hooks

### useAnalytics

```typescript
const { data, loading, error, refetch } = useAnalytics();

// Returns:
// - data: Dashboard metrics
// - loading: boolean
// - error: string | null
// - refetch: () => void
```

### useSalaryBenchmark

```typescript
const { data, loading, error, compareSalary } = useSalaryBenchmark();

await compareSalary(salary, industry, role);

// Returns:
// - data: Comparison result
// - loading: boolean
// - error: string | null
// - compareSalary: async function
```

### useCollaboration

```typescript
const {
  sessionData,
  isConnected,
  error,
  joinSession,
  leaveSession,
  shareComparison,
  selectCompany
} = useCollaboration();

await joinSession(sessionId, userName);

// Returns all session methods
```

### useSalaryStats

```typescript
const { stats, loading, error, refetch } = useSalaryStats();

// Returns salary statistics
```

---

## 📊 Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS
- **State**: React Hooks (useState, useContext)
- **Real-time**: Socket.io Client
- **Charts**: Chart.js, Recharts
- **HTTP**: Fetch API
- **GraphQL** (optional): Apollo Client

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Real-time**: Socket.io
- **Database**: PostgreSQL (với Hasura) / SQLite (dev)
- **ORM**: TypeORM (optional)
- **Validation**: class-validator
- **API**: REST + WebSocket

### DevOps
- **Docker**: PostgreSQL, Hasura
- **Package Manager**: npm
- **Development**: nodemon, ts-node

### External Services
- **Adecco Vietnam**: Salary data
- **Chart.js**: Visualizations
- **Hasura** (optional): GraphQL engine

---

## 📁 Cấu Trúc Thư Mục

```
excel_app/
├── backend/
│   ├── src/
│   │   ├── companies/
│   │   │   ├── companies.service.ts
│   │   │   ├── companies.controller.ts
│   │   │   └── companies.module.ts
│   │   ├── comparisons/
│   │   │   ├── comparisons.service.ts
│   │   │   ├── comparisons.controller.ts
│   │   │   ├── comparison.gateway.ts (WebSocket)
│   │   │   └── comparisons.module.ts
│   │   ├── ai/
│   │   │   ├── ai.service.ts
│   │   │   ├── ai.controller.ts
│   │   │   └── ai.module.ts
│   │   ├── analytics/
│   │   │   ├── analytics.service.ts
│   │   │   ├── analytics.controller.ts
│   │   │   └── analytics.module.ts
│   │   ├── salary-benchmark/
│   │   │   ├── salary-benchmark.service.ts
│   │   │   ├── salary-benchmark.controller.ts
│   │   │   └── salary-benchmark.module.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx (Main page - 6 tabs)
    │   │   ├── component/
    │   │   │   ├── CompanyForm.tsx
    │   │   │   ├── ComparisonTable.tsx
    │   │   │   ├── ComparisonChart.tsx
    │   │   │   ├── AIRecommendations.tsx
    │   │   │   ├── AnalyticsDashboard.tsx
    │   │   │   ├── SalaryComparison.tsx
    │   │   │   └── RealTimeCollaboration.tsx
    │   │   └── layout.tsx
    │   ├── hooks/
    │   │   ├── useAnalytics.ts
    │   │   ├── useSalaryBenchmark.ts
    │   │   ├── useCollaboration.ts
    │   │   └── useSalaryStats.ts
    │   ├── type/
    │   │   └── company.ts
    │   └── styles/
    │       └── globals.css
    ├── package.json
    ├── tailwind.config.ts
    └── next.config.js
```

---

## 🔧 Cấu Hình

### Environment Variables (Backend)

```bash
# .env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/excel_app
ADECCO_API_KEY=your_key_here
CORS_ORIGIN=http://localhost:3001
```

### Environment Variables (Frontend)

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

---

## 🐛 Troubleshooting

### Backend lỗi port 3000

```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Hoặc thay đổi port
PORT=3001 npm run start:dev
```

### Frontend không kết nối backend

```bash
# Verify backend running
curl http://localhost:3000/api/companies

# Check CORS
# Backend: app.enableCors()

# Check API_URL in .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### WebSocket connection failed

```bash
# Verify Socket.io listening
# Backend: app.useWebSocketAdapter(new IoAdapter(app))

# Check CORS for WebSocket
// In NestJS gateway
@WebSocketGateway({
  cors: { origin: 'http://localhost:3001' }
})
```

### Database connection error

```bash
# Verify PostgreSQL running
docker ps | grep postgres

# Check connection string
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/excel_app
```

---

## 📚 Tài Liệu Thêm

### Guides Có Sẵn

1. **FRONTEND_COMPONENTS_COMPLETE.md** - 3 components chi tiết
2. **CUSTOM_HOOKS_COMPLETE.md** - 4 custom hooks
3. **HASURA_SETUP_STEP_BY_STEP.md** - Setup Hasura (real-time GraphQL)
4. **PAGE_FIXED_WITH_TABS.md** - Main page với 6 tabs
5. **FIX_*.md** - Các file fix lỗi khác nhau

### Tài Liệu Official

- [NestJS Docs](https://docs.nestjs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Socket.io Docs](https://socket.io/docs)
- [Chart.js Docs](https://www.chartjs.org)
- [Tailwind CSS](https://tailwindcss.com)

### Có thể tìm hiểu thêm

- **GraphQL**: Apollo Client, Hasura
- **Database**: PostgreSQL, Prisma ORM
- **Authentication**: JWT, Auth0
- **Deployment**: Docker, AWS, Vercel

---

## 🚀 Next Steps

1. ✅ Setup backend & frontend
2. ✅ Thêm 5-10 công ty test
3. ✅ So sánh công ty
4. ✅ Kiểm tra AI gợi ý
5. ✅ Xem analytics
6. ✅ Test salary benchmarking
7. ✅ Join collaboration session
8. 📈 Tối ưu & deploy

---

## 📝 License

MIT License - Bạn có thể sử dụng tự do cho mục đích cá nhân hoặc thương mại

---

## 💬 Support

Nếu có vấn đề:

1. Kiểm tra **Troubleshooting** phía trên
2. Xem các file **FIX_*.md**
3. Kiểm tra logs: `npm run start:dev`
4. Verify imports & file paths

---

## 🎉 Chúc mừng!

Bạn có một hệ thống đầy đủ để:
- ✅ So sánh công ty
- ✅ Nhận gợi ý AI
- ✅ Phân tích lương
- ✅ Xem analytics
- ✅ Hợp tác real-time

**Happy coding! 🚀**
