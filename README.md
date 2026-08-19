# Loan Approval Prediction System

An intelligent, full-stack application that evaluates loan applications, predicts approval outcomes using a Machine Learning model, and provides financial insights. This project is built with a modern React frontend and a FastAPI + scikit-learn backend.

## 🚀 Features

- **Loan Approval Prediction**: Predicts loan approval probability based on 7 key applicant features using a pre-trained scikit-learn model.
- **Maximum Eligible Loan Estimation**: A smart feature that uses a coarse-to-fine search algorithm to determine the maximum loan amount an applicant is eligible for, without altering the existing ML model.
- **New-to-Credit (NTC) Assessment**: An alternative evaluation flow for users without an extensive credit history.
- **AI Loan Assistant**: Integrated with Google GenAI to answer user queries and provide context-aware financial guidance based on their application.
- **EMI Calculator**: A built-in calculator to estimate monthly installment amounts.
- **Financial Quiz**: An interactive quiz to test financial literacy.
- **Model Performance & Interpretability**: Uses SHAP (SHapley Additive exPlanations) to provide insights into how different features impact the loan approval prediction.

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Routing**: React Router DOM
- **Forms & Validation**: React Hook Form, Zod
- **API Client**: Axios
- **Utilities**: jsPDF (for exporting results)

### Backend
- **Framework**: FastAPI (Python)
- **Machine Learning**: scikit-learn, joblib, pandas, numpy
- **Interpretability**: SHAP
- **AI Integration**: google-genai
- **Testing**: pytest

## 📁 Project Structure

```
Loan-Approval-Prediction/
├── frontend/           # React frontend application
│   ├── src/            # Source code (Components, Pages, Services)
│   ├── public/         # Static assets
│   ├── package.json    # Frontend dependencies
│   └── vite.config.ts  # Vite configuration
├── backend/            # FastAPI backend application
│   ├── routes/         # API routing (loan, ntc, assistant)
│   ├── schemas/        # Pydantic validation schemas
│   ├── services/       # Core business logic and ML prediction
│   ├── model/          # Serialized ML models (.pkl)
│   ├── tests/          # Pytest test cases
│   ├── app.py          # FastAPI application entry point
│   └── requirements.txt# Backend Python dependencies
├── MAX_LOAN_FEATURE_SPEC.md  # Detailed specification for the max loan feature
└── README.md           # Project documentation
```

## ⚙️ Setup and Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd Loan-Approval-Prediction
```

### 2. Backend Setup

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your required API keys (e.g., Google GenAI API key)

# Run the FastAPI server
uvicorn app:app --reload --port 8000
```
*The backend API will be available at `http://localhost:8000`. You can view the interactive API documentation at `http://localhost:8000/docs`.*

### 3. Frontend Setup

Open a new terminal window/tab:

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```
*The frontend application will be available at `http://localhost:5173` (or the port provided by Vite).*

## 🧪 Testing

### Backend Tests
To run the backend test suite, navigate to the `backend` directory and run:
```bash
pytest
```

### Frontend Linting
To run ESLint on the frontend codebase:
```bash
cd frontend
npm run lint
```

## 🧠 Machine Learning Model Details

The core prediction is handled by a serialized scikit-learn model (`7_feature_loan_approval_model.pkl`). The 7 features used for evaluation are:
1. Dependents
2. Employment Type
3. Annual Income
4. Credit Score
5. Loan Tenure
6. Education
7. Requested Loan Amount

> **Important**: The application treats the production model as immutable. The *Maximum Eligible Loan* feature iterates over different loan amounts and queries the model dynamically to find the upper bound of approval, ensuring the core prediction logic remains untouched.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
