import React, { useState } from 'react';
import { Card, Button, Alert, Badge, Row, Col, Form, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MissingValueImputation = ({ onComplete, fileData, selectedTemplate, schemaMappings, validationResults, edaResults }) => {
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [imputationResults, setImputationResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const imputationMethods = [
    {
      id: 'mean',
      name: 'Mean Imputation',
      description: 'Replace missing values with the mean of the column',
      icon: '📊',
      confidence: 'High for normally distributed data',
      bestFor: 'Numerical data with normal distribution'
    },
    {
      id: 'median',
      name: 'Median Imputation',
      description: 'Replace missing values with the median of the column',
      icon: '📈',
      confidence: 'High for skewed data',
      bestFor: 'Numerical data with outliers or skewed distribution'
    },
    {
      id: 'knn',
      name: 'K-Nearest Neighbors',
      description: 'Use similar rows to estimate missing values',
      icon: '🎯',
      confidence: 'Medium to High',
      bestFor: 'Complex relationships between variables'
    }
  ];

  const handleColumnToggle = (column) => {
    setSelectedColumns(prev => 
      prev.includes(column) 
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const handleImputation = async () => {
    if (!selectedColumns.length || !selectedMethod) return;

    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('columns', JSON.stringify(selectedColumns));
      formData.append('method', selectedMethod);
      
      const response = await axios.post('/impute', formData);
      setImputationResults(response.data);
      
      // Complete the step after a short delay
      setTimeout(() => {
        onComplete(response.data);
        navigate('/outliers');
      }, 1000);

    } catch (err) {
      setError(err.response?.data?.detail || 'Imputation failed');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendedMethod = (column) => {
    // Simple recommendation logic based on column name patterns
    if (column.includes('age') || column.includes('count') || column.includes('size')) {
      return 'median';
    } else if (column.includes('income') || column.includes('expenditure') || column.includes('amount')) {
      return 'mean';
    } else {
      return 'knn';
    }
  };

  const getConfidenceScore = (column, method) => {
    const recommended = getRecommendedMethod(column);
    if (method === recommended) return 0.9;
    if (method === 'median' && recommended === 'mean') return 0.7;
    if (method === 'mean' && recommended === 'median') return 0.7;
    return 0.6;
  };

  if (!fileData || !selectedTemplate || !schemaMappings || !validationResults || !edaResults) {
    return (
      <div className="main-content">
        <Alert variant="warning">
          <strong>Missing data!</strong> Please complete previous steps first.
        </Alert>
      </div>
    );
  }

  return (
    <div className="main-content">
      <Card className="card-custom">
        <Card.Header className="text-center">
          <h2>🔧 Missing Value Imputation</h2>
          <p className="text-muted">Handle missing values using intelligent imputation strategies</p>
        </Card.Header>
        <Card.Body>
          <div className="mb-4">
            <h5>📋 Imputation Methods</h5>
            <Row>
              {imputationMethods.map((method) => (
                <Col key={method.id} md={4} className="mb-3">
                  <Card 
                    className={`border-${selectedMethod === method.id ? 'primary' : 'light'} h-100`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <Card.Body className="text-center">
                      <div className="fs-1 mb-2">{method.icon}</div>
                      <Card.Title className="h6">{method.name}</Card.Title>
                      <Card.Text className="text-muted small">
                        {method.description}
                      </Card.Text>
                      <div className="mt-2">
                        <Badge bg="info" className="me-1">
                          {method.confidence}
                        </Badge>
                        <Badge bg="secondary" className="me-1">
                          {method.bestFor}
                        </Badge>
                      </div>
                      {selectedMethod === method.id && (
                        <Badge bg="primary" className="mt-2">Selected</Badge>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          <div className="mb-4">
            <h5>📊 Select Columns for Imputation</h5>
            <p className="text-muted">Choose which columns have missing values that need imputation</p>
            
            <div className="row">
              {fileData.columns?.map((column) => {
                const recommendedMethod = getRecommendedMethod(column);
                const confidence = getConfidenceScore(column, selectedMethod || recommendedMethod);
                
                return (
                  <div key={column} className="col-md-4 col-sm-6 mb-2">
                    <Card 
                      className={`border-${selectedColumns.includes(column) ? 'success' : 'light'} h-100`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleColumnToggle(column)}
                    >
                      <Card.Body className="p-2 text-center">
                        <Form.Check
                          type="checkbox"
                          checked={selectedColumns.includes(column)}
                          onChange={() => handleColumnToggle(column)}
                          label={column}
                          className="mb-1"
                        />
                        <div className="small text-muted">
                          <Badge bg="secondary" className="me-1">
                            {recommendedMethod}
                          </Badge>
                          <Badge bg="info">
                            {confidence.toFixed(1)}
                          </Badge>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedColumns.length > 0 && selectedMethod && (
            <div className="mb-4">
              <h5>🎯 Imputation Summary</h5>
              <Alert variant="info" className="alert-custom">
                <Row>
                  <Col md={4}>
                    <strong>Columns Selected:</strong><br />
                    <Badge bg="primary">{selectedColumns.length}</Badge>
                  </Col>
                  <Col md={4}>
                    <strong>Method:</strong><br />
                    <Badge bg="success" className="text-capitalize">
                      {selectedMethod}
                    </Badge>
                  </Col>
                  <Col md={4}>
                    <strong>Average Confidence:</strong><br />
                    <Badge bg="info">
                      {(selectedColumns.reduce((sum, col) => 
                        sum + getConfidenceScore(col, selectedMethod), 0) / selectedColumns.length).toFixed(1)
                      }
                    </Badge>
                  </Col>
                </Row>
              </Alert>
            </div>
          )}

          {imputationResults && (
            <div className="mb-4">
              <Alert variant="success" className="alert-custom">
                <h5>✅ Imputation Completed Successfully!</h5>
                <p><strong>Method Used:</strong> {imputationResults.message}</p>
                <p><strong>Data Shape:</strong> {imputationResults.data_shape}</p>
                <Badge bg="success" className="ms-2">
                  Ready for next step
                </Badge>
              </Alert>
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
              onClick={handleImputation}
              disabled={!selectedColumns.length || !selectedMethod || loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner me-2"></span>
                  Applying Imputation...
                </>
              ) : (
                'Apply Imputation'
              )}
            </Button>
          </div>

          <div className="mt-4">
            <h5>💡 Imputation Guidelines</h5>
            <ul className="text-muted">
              <li><strong>Mean:</strong> Best for normally distributed numerical data</li>
              <li><strong>Median:</strong> Robust against outliers, good for skewed data</li>
              <li><strong>KNN:</strong> Preserves relationships between variables</li>
              <li>Consider the nature of your data when choosing methods</li>
              <li>Review results to ensure imputation makes sense</li>
            </ul>
          </div>

          <div className="mt-4">
            <h5>🔍 What Happens Next</h5>
            <p className="text-muted">
              After imputation, your dataset will be ready for outlier detection. The imputation process 
              will fill in missing values while preserving the statistical properties of your data.
            </p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default MissingValueImputation;




