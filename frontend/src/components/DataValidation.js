import React, { useState } from 'react';
import { Card, Button, Alert, Form, Table, Badge, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DataValidation = ({ onComplete, fileData, selectedTemplate, schemaMappings }) => {
  const [customRules, setCustomRules] = useState({});
  const [validationResults, setValidationResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const predefinedRules = {
    age: ['age > 0', 'age < 120'],
    income: ['income >= 0'],
    expenditure: ['expenditure >= 0'],
    household_size: ['household_size > 0', 'household_size < 20']
  };

  const handleCustomRuleChange = (column, ruleIndex, value) => {
    setCustomRules(prev => ({
      ...prev,
      [column]: prev[column] ? 
        prev[column].map((rule, idx) => idx === ruleIndex ? value : rule) :
        [value]
    }));
  };

  const addCustomRule = (column) => {
    setCustomRules(prev => ({
      ...prev,
      [column]: [...(prev[column] || []), '']
    }));
  };

  const removeCustomRule = (column, ruleIndex) => {
    setCustomRules(prev => ({
      ...prev,
      [column]: prev[column].filter((_, idx) => idx !== ruleIndex)
    }));
  };

  const performValidation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('rules', JSON.stringify(customRules));
      
      const response = await axios.post('/validate', formData);
      setValidationResults(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (validationResults) {
      onComplete(validationResults);
      navigate('/eda');
    }
  };

  const getValidationStatus = (results) => {
    if (!results || !results.validation_results) return { passed: 0, failed: 0, total: 0 };
    
    let passed = 0, failed = 0, total = 0;
    
    Object.values(results.validation_results).forEach(columnResults => {
      if (Array.isArray(columnResults)) {
        columnResults.forEach(rule => {
          total++;
          if (rule.passed) passed++;
          else failed++;
        });
      }
    });
    
    return { passed, failed, total };
  };

  if (!fileData || !selectedTemplate || !schemaMappings) {
    return (
      <div className="main-content">
        <Alert variant="warning">
          <strong>Missing data!</strong> Please complete previous steps first.
        </Alert>
      </div>
    );
  }

  const status = getValidationStatus(validationResults);

  return (
    <div className="main-content">
      <Card className="card-custom">
        <Card.Header className="text-center">
          <h2>✅ Data Validation</h2>
          <p className="text-muted">Apply validation rules and clean your data</p>
        </Card.Header>
        <Card.Body>
          <div className="mb-4">
            <h5>📋 Predefined Validation Rules</h5>
            <Row>
              {Object.entries(predefinedRules).map(([column, rules]) => (
                <Col key={column} md={6} className="mb-3">
                  <Card className="border-primary">
                    <Card.Header className="bg-primary text-white">
                      <strong>{column}</strong>
                    </Card.Header>
                    <Card.Body>
                      {rules.map((rule, index) => (
                        <Badge key={index} bg="info" className="me-2 mb-2">
                          {rule}
                        </Badge>
                      ))}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          <div className="mb-4">
            <h5>✏️ Custom Validation Rules</h5>
            <p className="text-muted">Add your own validation rules for specific columns</p>
            
            {Object.keys(predefinedRules).map(column => (
              <div key={column} className="mb-3">
                <h6>{column}</h6>
                <div className="d-flex flex-wrap gap-2 mb-2">
                  {(customRules[column] || []).map((rule, index) => (
                    <div key={index} className="d-flex align-items-center">
                      <Form.Control
                        type="text"
                        value={rule}
                        onChange={(e) => handleCustomRuleChange(column, index, e.target.value)}
                        placeholder="e.g., age > 18"
                        className="rule-input"
                        style={{ width: '200px' }}
                      />
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeCustomRule(column, index)}
                        className="ms-2"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => addCustomRule(column)}
                  >
                    + Add Rule
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="d-grid gap-2 mb-4">
            <Button
              variant="primary"
              size="lg"
              className="btn-custom"
              onClick={performValidation}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner me-2"></span>
                  Validating Data...
                </>
              ) : (
                'Run Validation'
              )}
            </Button>
          </div>

          {validationResults && (
            <div className="mb-4">
              <h5>📊 Validation Results</h5>
              <Row className="text-center mb-3">
                <Col md={4}>
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <h6 className="text-success">Passed</h6>
                    <Badge bg="success" className="fs-5">{status.passed}</Badge>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="bg-danger bg-opacity-10 p-3 rounded">
                    <h6 className="text-danger">Failed</h6>
                    <Badge bg="danger" className="fs-5">{status.failed}</Badge>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="bg-info bg-opacity-10 p-3 rounded">
                    <h6 className="text-info">Total</h6>
                    <Badge bg="info" className="fs-5">{status.total}</Badge>
                  </div>
                </Col>
              </Row>

              <div className="mb-3">
                <h6>Data Cleaning Summary</h6>
                <Alert variant="info">
                  <strong>Rows removed:</strong> {validationResults.rows_removed || 0}<br />
                  <strong>Remaining rows:</strong> {validationResults.remaining_rows || 0}
                </Alert>
              </div>

              {validationResults.validation_results && Object.keys(validationResults.validation_results).length > 0 && (
                <div className="validation-details">
                  <h6>Detailed Results</h6>
                  <Table responsive striped>
                    <thead>
                      <tr>
                        <th>Column</th>
                        <th>Rule</th>
                        <th>Status</th>
                        <th>Invalid Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(validationResults.validation_results).map(([column, rules]) => {
                        if (Array.isArray(rules) && rules.length > 0) {
                          return rules.map((rule, index) => (
                            <tr key={`${column}-${index}`}>
                              <td><strong>{column}</strong></td>
                              <td><code>{rule.rule}</code></td>
                              <td>
                                <Badge 
                                  bg={rule.passed ? 'success' : 'danger'}
                                  className="status-badge"
                                >
                                  {rule.passed ? 'PASSED' : 'FAILED'}
                                </Badge>
                              </td>
                              <td>{rule.invalid_count}</td>
                            </tr>
                          ));
                        }
                        return null;
                      })}
                    </tbody>
                  </Table>
                </div>
              )}
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
              disabled={!validationResults}
            >
              Continue to Exploratory Analysis
            </Button>
          </div>

          <div className="mt-4">
            <h5>💡 Validation Tips</h5>
            <ul className="text-muted">
              <li><strong>Predefined rules</strong> are automatically applied based on your template</li>
              <li><strong>Custom rules</strong> allow you to add specific business logic</li>
              <li><strong>Failed validations</strong> will remove invalid data rows</li>
              <li>Review results before proceeding to ensure data quality</li>
              <li>You can modify rules and re-run validation if needed</li>
            </ul>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DataValidation;
