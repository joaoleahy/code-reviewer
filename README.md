# AI-Powered Code Review System

A web system that allows developers to submit code for automated AI-powered review.

## 🏗️ Architecture

- **Frontend**: React.js with TypeScript
- **Backend**: FastAPI with Python
- **Database**: MongoDB
- **AI**: OpenAI API
- **Background Jobs**: FastAPI Background Tasks

## 📁 Project Structure

```
codereviewer/
├── backend/                 # FastAPI API
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Core configurations
│   │   ├── models/         # Pydantic models
│   │   ├── services/       # Services (AI, MongoDB)
│   │   └── utils/          # Utilities
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

#### 3. MongoDB
```bash
# Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use locally installed MongoDB
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
- **Data Models** - User and Review models with validation
- **Configuration** - Settings loading and environment detection
- **Utilities** - Import validation and helper functions
- **Programming Languages** - Supported language validation
- **Review Statuses** - Status enumeration validation

#### Features

- ✅ **Fast execution** (< 1 second)
- ✅ **No external dependencies** (MongoDB, OpenAI API not required)
- ✅ **Clean setup** - Automatic test environment configuration
- ✅ **Comprehensive coverage** - 9 test classes, 17 test methods
- ✅ **Easy maintenance** - Simple structure without mocks

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

- [x] Code submission interface
- [x] Real-time syntax highlighting
- [x] AI code review service
- [x] MongoDB storage
- [x] Analytics dashboard
- [x] Rate limiting
- [x] Background processing
- [x] CSV export
- [x] Responsive design

## 🔧 Configuration

See the `.env.example` file for all required environment variables.

## 📈 Scalability Considerations

- Rate limiting implemented (10 reviews per IP per hour)
- Asynchronous processing for reviews
- MongoDB indexing for efficient queries
- Connection pooling for MongoDB
- Common result caching
# code-reviewer
