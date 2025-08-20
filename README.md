# Data Preparation Prototype

A comprehensive web application for data preprocessing and analysis with a modern React frontend and FastAPI backend.

## Features

- **File Upload & Conversion**: Support for CSV and JSON files with automatic conversion
- **Template Selection**: Predefined templates for different data types (Household, Industrial, Employment, Other)
- **Schema Mapping**: Intelligent column mapping using regex and cosine similarity
- **Rule-based Validation**: Customizable validation rules with data cleaning
- **Exploratory Data Analysis**: Automated EDA with interactive visualizations
- **Missing Value Imputation**: Multiple imputation strategies with confidence scoring
- **Outlier Detection**: Various outlier detection methods with recommendations
- **LLM Report Generation**: AI-powered report generation using Gemini API

## Tech Stack

### Frontend
- React 18
- HTML5/CSS3
- JavaScript/TypeScript
- Modern UI components

### Backend
- FastAPI (Python)
- pandas for data manipulation
- ydata-profiling for EDA
- scikit-learn for ML operations
- WeasyPrint for PDF generation

## Project Structure

```
data_prep_prototype_2/
├── frontend/                 # React frontend application
├── backend/                  # FastAPI backend application
├── docs/                     # Documentation
├── requirements.txt          # Python dependencies
└── README.md                # This file
```

## Setup Instructions

### Backend Setup
1. Navigate to `backend/` directory
2. Create virtual environment: `python -m venv venv`
3. Activate virtual environment: `venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Run server: `uvicorn main:app --reload`

### Frontend Setup
1. Navigate to `frontend/` directory
2. Install dependencies: `npm install`
3. Start development server: `npm start`

## API Endpoints

- `POST /upload` - File upload and conversion
- `POST /map-schema` - Schema mapping
- `POST /validate` - Data validation
- `POST /eda` - Generate EDA report
- `POST /impute` - Missing value imputation
- `POST /detect-outliers` - Outlier detection
- `POST /generate-report` - LLM report generation

## License

MIT License




