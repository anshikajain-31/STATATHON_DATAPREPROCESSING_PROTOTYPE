import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Badge, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TemplateSelection = ({ onComplete, fileData }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateDetails, setTemplateDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/templates');
      setTemplates(response.data.templates);
    } catch (err) {
      setError('Failed to fetch templates');
    }
  };

  const handleTemplateSelect = async (templateName) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/template/${templateName}`);
      setTemplateDetails(response.data);
      setSelectedTemplate(templateName);
    } catch (err) {
      setError('Failed to fetch template details');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      onComplete(selectedTemplate);
      navigate('/mapping');
    }
  };

  const getTemplateIcon = (templateName) => {
    switch (templateName) {
      case 'household':
        return '🏠';
      case 'industrial':
        return '🏭';
      case 'employment':
        return '💼';
      case 'other':
        return '📊';
      default:
        return '📋';
    }
  };

  const getTemplateDescription = (templateName) => {
    switch (templateName) {
      case 'household':
        return 'Household consumption expenditure data with demographic and financial information';
      case 'industrial':
        return 'Industrial and business data including company metrics and financials';
      case 'employment':
        return 'Employment and workforce data with job details and performance metrics';
      case 'other':
        return 'Generic template for custom data structures';
      default:
        return 'Template description not available';
    }
  };

  const getTemplateColumns = (templateName) => {
    switch (templateName) {
      case 'household':
        return [
          'household_id', 'member_id', 'age', 'gender', 'education', 'occupation',
          'income', 'expenditure', 'food_expenditure', 'housing_expenditure',
          'transport_expenditure', 'health_expenditure', 'education_expenditure',
          'entertainment_expenditure', 'clothing_expenditure', 'utilities_expenditure',
          'household_size', 'children_count', 'elderly_count', 'working_members',
          'rural_urban', 'state', 'district', 'village', 'caste', 'religion',
          'land_ownership', 'house_ownership', 'vehicle_ownership', 'bank_account',
          'insurance_coverage', 'pension_coverage', 'health_insurance', 'loan_amount',
          'savings_amount', 'investment_amount', 'debt_amount', 'asset_value',
          'monthly_income', 'annual_income', 'poverty_line', 'consumption_quintile'
        ];
      case 'industrial':
        return [
          'company_id', 'industry_type', 'employee_count', 'revenue', 'profit',
          'assets', 'liabilities', 'equity', 'market_cap', 'stock_price'
        ];
      case 'employment':
        return [
          'employee_id', 'job_title', 'department', 'salary', 'experience_years',
          'education_level', 'skills', 'performance_rating', 'hire_date'
        ];
      case 'other':
        return [];
      default:
        return [];
    }
  };

  if (!fileData) {
    return (
      <div className="main-content">
        <Alert variant="warning">
          <strong>No file uploaded!</strong> Please upload a file first.
        </Alert>
      </div>
    );
  }

  return (
    <div className="main-content">
      <Card className="card-custom">
        <Card.Header className="text-center">
          <h2>📋 Template Selection</h2>
          <p className="text-muted">Choose a template that best matches your data structure</p>
        </Card.Header>
        <Card.Body>
          <div className="mb-4">
            <h5>📊 Your Data Summary</h5>
            <div className="d-flex justify-content-around text-center">
              <div>
                <h6>File</h6>
                <Badge bg="info">{fileData.message}</Badge>
              </div>
              <div>
                <h6>Columns</h6>
                <Badge bg="primary">{fileData.columns?.length || 0}</Badge>
              </div>
              <div>
                <h6>Rows</h6>
                <Badge bg="success">{fileData.rows || 0}</Badge>
              </div>
            </div>
          </div>

          <Row className="g-4">
            {templates.map((template) => {
              const columns = getTemplateColumns(template);
              const isSelected = selectedTemplate === template;
              
              return (
                <Col key={template} md={6} lg={4}>
                  <Card 
                    className={`card-custom h-100 ${isSelected ? 'border-primary' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <Card.Body className="text-center">
                      <div className="fs-1 mb-3">{getTemplateIcon(template)}</div>
                      <Card.Title className="text-capitalize">
                        {template.replace('_', ' ')} Template
                      </Card.Title>
                      <Card.Text className="text-muted small">
                        {getTemplateDescription(template)}
                      </Card.Text>
                      
                      <div className="mt-3">
                        <Badge bg="secondary" className="me-1">
                          {columns.length} columns
                        </Badge>
                        {template === 'household' && (
                          <Badge bg="success" className="me-1">
                            Recommended
                          </Badge>
                        )}
                      </div>

                      {isSelected && (
                        <div className="mt-3">
                          <Badge bg="primary">Selected</Badge>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {selectedTemplate && templateDetails.columns && (
            <div className="mt-4">
              <h5>📋 Template Columns Preview</h5>
              <div className="bg-light p-3 rounded">
                <div className="row">
                  {templateDetails.columns.slice(0, 12).map((col, index) => (
                    <div key={index} className="col-md-3 col-sm-6 mb-2">
                      <Badge bg="light" text="dark" className="w-100">
                        {col}
                      </Badge>
                    </div>
                  ))}
                  {templateDetails.columns.length > 12 && (
                    <div className="col-12 text-center">
                      <Badge bg="secondary">
                        +{templateDetails.columns.length - 12} more columns
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="danger" className="alert-custom mt-3">
              <strong>Error:</strong> {error}
            </Alert>
          )}

          <div className="d-grid gap-2 mt-4">
            <Button
              variant="primary"
              size="lg"
              className="btn-custom"
              onClick={handleContinue}
              disabled={!selectedTemplate || loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner me-2"></span>
                  Loading...
                </>
              ) : (
                'Continue to Schema Mapping'
              )}
            </Button>
          </div>

          <div className="mt-4">
            <h5>💡 Template Benefits</h5>
            <ul className="text-muted">
              <li><strong>Household:</strong> Comprehensive demographic and financial data structure</li>
              <li><strong>Industrial:</strong> Business metrics and financial performance data</li>
              <li><strong>Employment:</strong> Workforce and job-related information</li>
              <li><strong>Other:</strong> Flexible template for custom data structures</li>
            </ul>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TemplateSelection;




