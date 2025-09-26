# AI-Powered Code Review System

A web system that allows developers to submit code for automated AI-powered review.

## 🏗️ Architecture

- **Frontend**: React.js with TypeScript
- **Backend**: FastAPI with Python
- **Database**: MongoDB
- **Cache**: Redis (Local/Upstash)
- **AI**: OpenAI GPT-4.1-mini
- **Background Jobs**: FastAPI Background Tasks

## 📁 Project Structure

```
codereviewer/
├── backend/                 # FastAPI API
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Core configurations
│   │   ├── models/         # Pydantic models
│   │   ├── services/       # Services (AI, Cache, MongoDB)
│   │   └── utils/          # Utilities
│   ├── tests/              # Comprehensive test suite
│   ├── requirements.txt
│   └── main.py
├── frontend/               # React App
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utilities
│   ├── package.json
│   └── public/
└── docker-compose.yml      # Container orchestration
```

## 🚀 How to Run

### Docker Compose (Recommended)

```bash
# 1. Configure environment variables
cp env.example .env
cp frontend/env.example frontend/.env

# 2. Set your OPENAI_API_KEY in the .env file
# OPENAI_API_KEY=sk-your-key-here

# 3. Start all services
docker-compose up -d

# 4. Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Local Development

#### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB
- Redis (optional - uses cache fallback)
- OpenAI API Key

#### 1. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Configure .env with your credentials
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend
```bash
cd frontend
npm install
npm start
```

#### 3. MongoDB & Redis
```bash
# Docker - MongoDB + Redis
docker run -d -p 27017:27017 --name mongodb mongo:latest
docker run -d -p 6379:6379 --name redis redis:alpine

# Or use locally installed services
```

## 🔧 Useful Commands

```bash
# Stop all services
docker-compose down

# View real-time logs
docker-compose logs -f

# Restart specific services
docker-compose restart backend
docker-compose restart frontend

# Container status
docker-compose ps

# Mongo Express (web interface for MongoDB)
docker-compose --profile tools up mongo-express
# Access: http://localhost:8081 (admin:admin)
```

## 📡 API Endpoints

- `POST /api/reviews` - Submit code for review
- `GET /api/reviews/{id}` - Get specific review  
- `GET /api/reviews` - List reviews (with pagination)
- `GET /api/stats` - Aggregated statistics
- `GET /api/cache/stats` - Cache performance metrics
- `DELETE /api/cache/clear` - Clear cache entries
- `GET /api/health` - Health check

## 🧪 Testing

### Backend Tests

The backend includes a comprehensive test suite designed for easy execution without external dependencies.

```bash
cd backend

# Run all tests
python -m pytest tests/test_simple.py -v

# Output example:
# 17 passed in 0.75s ✅
```

#### Test Coverage

The test suite covers:

- **JWT Authentication** - Token creation and validation
- **Rate Limiting** - Request throttling functionality  
- **AI Service** - Prompt building and service initialization
- **Review Service** - Core review functionality
- **Cache Service** - Redis caching with fallback mechanisms
- **Data Models** - User and Review models with validation
- **Configuration** - Settings loading and environment detection
- **Utilities** - Import validation and helper functions
- **Programming Languages** - Supported language validation
- **Review Statuses** - Status enumeration validation

#### Features

- ✅ **Fast execution** (< 1 second)
- ✅ **No external dependencies** (MongoDB, Redis, OpenAI API not required)
- ✅ **Clean setup** - Automatic test environment configuration
- ✅ **Comprehensive coverage** - 10 test classes, 24 test methods
- ✅ **Easy maintenance** - Simple structure with minimal mocking

### Example Tests

### Python (with issues):
```python
def calculate_average(numbers):
    return sum(numbers) / len(numbers)

result = calculate_average([])
```

### JavaScript (needs improvements):
```javascript
function fetchUserData(userId) {
    fetch('/api/users/' + userId)
        .then(response => response.json())
        .then(data => console.log(data));
}
```

## 📊 Implemented Features

- [x] **Code submission interface** - Upload and submit code for review
- [x] **Real-time syntax highlighting** - Code visualization with syntax support
- [x] **AI code review service** - Automated analysis using OpenAI GPT-4.1-mini
- [x] **Intelligent caching system** - Redis cache with 1000x+ performance improvement
- [x] **MongoDB storage** - Persistent data storage and retrieval
- [x] **Analytics dashboard** - Usage statistics and insights
- [x] **Rate limiting** - Request throttling (10 reviews/hour per IP)
- [x] **Background processing** - Asynchronous review processing
- [x] **CSV export** - Data export functionality
- [x] **Responsive design** - Mobile-friendly interface
- [x] **Docker containerization** - Easy deployment and scaling
- [x] **Comprehensive testing** - 24 test methods with 100% critical path coverage

## 🔧 Configuration

See the `.env.example` file for all required environment variables.

### Redis Cache Configuration

The system supports both local and production Redis configurations:

**Development (Local Redis):**
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # optional
```

**Production (Upstash Redis):**
```bash
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

**Environment Detection:**
- If Upstash credentials are provided → Uses Upstash Redis
- Otherwise → Falls back to local Redis
- If Redis unavailable → Gracefully continues without cache

## 📈 Performance & Scalability

### 🚀 Cache Performance
- **Redis integration** - Instant responses for duplicate code analysis
- **1000x+ performance improvement** - Cache hits respond in ~0.002s vs ~2.2s API calls
- **100% API call reduction** - Zero OpenAI requests for cached results
- **Dual environment support** - Local Redis (development) + Upstash (production)

### 🔧 Production Ready
- **Rate limiting** - 10 reviews per IP per hour
- **Asynchronous processing** - Non-blocking review operations
- **MongoDB indexing** - Optimized database queries
- **Connection pooling** - Efficient resource management
- **Intelligent fallbacks** - Graceful degradation when cache unavailable
- **Environment detection** - Automatic local/production configuration

### 📊 Cache Statistics
Access real-time cache metrics via `/api/cache/stats`:
- Cache hit/miss rates
- Performance improvements
- Memory usage
- Most frequently cached code patterns
# code-reviewer
