import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import StepIndicator from './components/StepIndicator';
import FileUpload from './components/FileUpload';
import TemplateSelection from './components/TemplateSelection';
import SchemaMapping from './components/SchemaMapping';
import DataValidation from './components/DataValidation';
import ExploratoryAnalysis from './components/ExploratoryAnalysis';
import MissingValueImputation from './components/MissingValueImputation';
import OutlierDetection from './components/OutlierDetection';
import ReportGeneration from './components/ReportGeneration';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [fileData, setFileData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [schemaMappings, setSchemaMappings] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [edaResults, setEdaResults] = useState(null);
  const [imputationResults, setImputationResults] = useState(null);
  const [outlierResults, setOutlierResults] = useState(null);

  const steps = [
    { id: 1, name: 'File Upload', path: '/upload' },
    { id: 2, name: 'Template Selection', path: '/template' },
    { id: 3, name: 'Schema Mapping', path: '/mapping' },
    { id: 4, name: 'Data Validation', path: '/validation' },
    { id: 5, name: 'Exploratory Analysis', path: '/eda' },
    { id: 6, name: 'Missing Value Imputation', path: '/imputation' },
    { id: 7, name: 'Outlier Detection', path: '/outliers' },
    { id: 8, name: 'Report Generation', path: '/report' }
  ];

  const handleStepComplete = (stepNumber, data) => {
    setCurrentStep(stepNumber + 1);
    
    // Store step data
    switch (stepNumber) {
      case 1:
        setFileData(data);
        break;
      case 2:
        setSelectedTemplate(data);
        break;
      case 3:
        setSchemaMappings(data);
        break;
      case 4:
        setValidationResults(data);
        break;
      case 5:
        setEdaResults(data);
        break;
      case 6:
        setImputationResults(data);
        break;
      case 7:
        setOutlierResults(data);
        break;
      default:
        break;
    }
  };

  const canAccessStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return true;
      case 2:
        return fileData !== null;
      case 3:
        return fileData !== null && selectedTemplate !== null;
      case 4:
        return fileData !== null && selectedTemplate !== null && schemaMappings !== null;
      case 5:
        return fileData !== null && selectedTemplate !== null && schemaMappings !== null && validationResults !== null;
      case 6:
        return fileData !== null && selectedTemplate !== null && schemaMappings !== null && validationResults !== null && edaResults !== null;
      case 7:
        return fileData !== null && selectedTemplate !== null && schemaMappings !== null && validationResults !== null && edaResults !== null && imputationResults !== null;
      case 8:
        return fileData !== null && selectedTemplate !== null && schemaMappings !== null && validationResults !== null && edaResults !== null && imputationResults !== null && outlierResults !== null;
      default:
        return false;
    }
  };

  return (
    <Router>
      <div className="app-container">
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
          <Container>
            <Navbar.Brand href="/" className="navbar-brand">
              📊 Data Preparation Prototype
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Nav.Link href="/upload">Home</Nav.Link>
                <Nav.Link href="https://github.com" target="_blank">GitHub</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Container>
          <StepIndicator 
            steps={steps} 
            currentStep={currentStep} 
            canAccessStep={canAccessStep}
          />

          <Routes>
            <Route 
              path="/" 
              element={<Navigate to="/upload" replace />} 
            />
            <Route 
              path="/upload" 
              element={
                <FileUpload 
                  onComplete={(data) => handleStepComplete(1, data)}
                  canAccess={canAccessStep(1)}
                />
              } 
            />
            <Route 
              path="/template" 
              element={
                <TemplateSelection 
                  onComplete={(data) => handleStepComplete(2, data)}
                  canAccess={canAccessStep(2)}
                  fileData={fileData}
                />
              } 
            />
            <Route 
              path="/mapping" 
              element={
                <SchemaMapping 
                  onComplete={(data) => handleStepComplete(3, data)}
                  canAccess={canAccessStep(3)}
                  fileData={fileData}
                  selectedTemplate={selectedTemplate}
                />
              } 
            />
            <Route 
              path="/validation" 
              element={
                <DataValidation 
                  onComplete={(data) => handleStepComplete(4, data)}
                  canAccess={canAccessStep(4)}
                  fileData={fileData}
                  selectedTemplate={selectedTemplate}
                  schemaMappings={schemaMappings}
                />
              } 
            />
            <Route 
              path="/eda" 
              element={
                <ExploratoryAnalysis 
                  onComplete={(data) => handleStepComplete(5, data)}
                  canAccess={canAccessStep(5)}
                  fileData={fileData}
                  selectedTemplate={selectedTemplate}
                  schemaMappings={schemaMappings}
                  validationResults={validationResults}
                />
              } 
            />
            <Route 
              path="/imputation" 
              element={
                <MissingValueImputation 
                  onComplete={(data) => handleStepComplete(6, data)}
                  canAccess={canAccessStep(6)}
                  fileData={fileData}
                  selectedTemplate={selectedTemplate}
                  schemaMappings={schemaMappings}
                  validationResults={validationResults}
                  edaResults={edaResults}
                />
              } 
            />
            <Route 
              path="/outliers" 
              element={
                <OutlierDetection 
                  onComplete={(data) => handleStepComplete(7, data)}
                  canAccess={canAccessStep(7)}
                  fileData={fileData}
                  selectedTemplate={selectedTemplate}
                  schemaMappings={schemaMappings}
                  validationResults={validationResults}
                  edaResults={edaResults}
                  imputationResults={imputationResults}
                />
              } 
            />
            <Route 
              path="/report" 
              element={
                <ReportGeneration 
                  canAccess={canAccessStep(8)}
                  fileData={fileData}
                  selectedTemplate={selectedTemplate}
                  schemaMappings={schemaMappings}
                  validationResults={validationResults}
                  edaResults={edaResults}
                  imputationResults={imputationResults}
                  outlierResults={outlierResults}
                />
              } 
            />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;




