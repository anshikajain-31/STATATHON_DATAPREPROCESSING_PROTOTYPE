# Setup Guide - Data Preparation Prototype

This guide will help you set up and run the Data Preparation Prototype application.

## Prerequisites

- **Python 3.8+** installed on your system
- **Node.js 16+** and npm installed on your system
- **Git** for cloning the repository

## Quick Start

### 1. Clone and Navigate to Project
```bash
git clone <repository-url>
cd data_prep_prototype_2
```

### 2. Backend Setup

#### Create Virtual Environment
```bash
cd backend
python -m venv venv
```

#### Activate Virtual Environment
**Windows:**
```bash
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Set Environment Variables
Create a `.env` file in the `backend/` directory:
```env
# Google Gemini API Key (optional for full functionality)
GOOGLE_API_KEY=your_gemini_api_key_here

# Server Configuration
HOST=0.0.0.0
PORT=8000

# CORS Settings
ALLOWED_ORIGINS=http://localhost:3000
```

#### Start Backend Server
```bash
python start.py
```

The backend will be available at: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Interactive API: http://localhost:8000/redoc

### 3. Frontend Setup

#### Navigate to Frontend Directory
```bash
cd ../frontend
```

#### Install Dependencies
```bash
npm install
```

#### Start Frontend Development Server
```bash
npm start
```

The frontend will be available at: http://localhost:3000

## Alternative Startup Methods

### Windows Users
- Use `start.bat` in the frontend directory
- Use `start.ps1` for PowerShell

### Backend Alternative
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Project Structure

```
data_prep_prototype_2/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main application file
│   ├── start.py            # Startup script
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/                # Source code
│   ├── public/             # Public assets
│   ├── package.json        # Node.js dependencies
│   └── start.bat/ps1       # Startup scripts
├── README.md               # Project overview
├── SETUP.md                # This setup guide
└── requirements.txt        # Root requirements
```

## Features

### Backend (FastAPI)
- ✅ File upload and conversion (CSV/JSON)
- ✅ Template-based schema mapping
- ✅ Rule-based data validation
- ✅ Exploratory Data Analysis (EDA)
- ✅ Missing value imputation
- ✅ Outlier detection
- ✅ AI-powered report generation (Gemini API)
- ✅ PDF report generation
- ✅ Data download in multiple formats

### Frontend (React)
- ✅ Modern, responsive UI
- ✅ Step-by-step workflow
- ✅ Real-time progress tracking
- ✅ Interactive data visualization
- ✅ Drag-and-drop file upload
- ✅ Template selection interface
- ✅ Schema mapping tools
- ✅ Validation rule management
- ✅ Download management

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/upload` | POST | File upload and conversion |
| `/templates` | GET | Get available templates |
| `/template/{name}` | GET | Get template columns |
| `/map-schema` | POST | Perform schema mapping |
| `/validate` | POST | Apply validation rules |
| `/eda` | POST | Generate EDA report |
| `/impute` | POST | Missing value imputation |
| `/detect-outliers` | POST | Outlier detection |
| `/generate-report` | POST | Generate AI report |
| `/download/{format}` | GET | Download processed data |

## Templates Available

1. **Household** - 40+ columns for consumption expenditure data
2. **Industrial** - Business and financial metrics
3. **Employment** - Workforce and job-related data
4. **Other** - Generic template for custom data

## Troubleshooting

### Common Issues

#### Backend Won't Start
- Ensure Python 3.8+ is installed
- Check if virtual environment is activated
- Verify all dependencies are installed
- Check if port 8000 is available

#### Frontend Won't Start
- Ensure Node.js 16+ is installed
- Check if npm is available
- Verify all dependencies are installed
- Check if port 3000 is available

#### File Upload Issues
- Check file size (max 50MB)
- Ensure file format is CSV or JSON
- Verify backend is running

#### API Connection Issues
- Ensure backend is running on port 8000
- Check CORS settings
- Verify network connectivity

### Getting Help

1. Check the console for error messages
2. Verify all prerequisites are met
3. Ensure both frontend and backend are running
4. Check the API documentation at http://localhost:8000/docs

## Development

### Adding New Features
1. Backend: Add new endpoints in `main.py`
2. Frontend: Create new components in `src/components/`
3. Update routing in `App.js`
4. Test thoroughly before committing

### Code Style
- Backend: Follow PEP 8 Python guidelines
- Frontend: Use consistent React patterns
- Include proper error handling
- Add meaningful comments

## Deployment

### Production Considerations
- Set `DEBUG=False` in environment
- Use production WSGI server (Gunicorn)
- Configure proper CORS settings
- Set up environment variables securely
- Use HTTPS in production

### Docker Support
Docker files can be added for containerized deployment.

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check console logs for errors
4. Create an issue in the repository

---

**Happy Data Preprocessing! 🚀📊**




