import React, { useState } from 'react';
import { Card, Button, Alert, Badge, Row, Col, Form, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const OutlierDetection = ({ onComplete, fileData, selectedTemplate, schemaMappings, validationResults, edaResults, imputationResults }) => {
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [outlierResults, setOutlierResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const outlierMethods = [
    {
      id: 'iqr',
      name: 'IQR Method',
      description: 'Detect outliers using Interquartile Range (Q3 - Q1)',
      icon: '📏',
      confidence: 'High for symmetric distributions',
      bestFor: 'Data with normal or symmetric distributions',
      threshold: '1.5 × IQR'
    },
    {
      id: 'zscore',
      name: 'Z-Score Method',
      description: 'Detect outliers using standard deviations from mean',
      icon: '📊',
      confidence: 'High for normal distributions',
      bestFor: 'Normally distributed data',
      threshold: '±3 standard deviations'
    },
    {
      id: 'isolation_forest',
      name: 'Isolation Forest',
      description: 'Machine learning approach for outlier detection',
      icon: '🌲',
      confidence: 'Medium to High',
      bestFor: 'Complex, non-linear relationships',
      threshold: '10% contamination'
    }
  ];

  const handleColumnToggle = (column) => {
    setSelectedColumns(prev => 
      prev.includes(column) 
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const handleOutlierDetection = async () => {
    if (!selectedColumns.length || !selectedMethod) return;

    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('columns', JSON.stringify(selectedColumns));
      formData.append('method', selectedMethod);
      
      const response = await axios.post('/detect-outliers', formData);
      setOutlierResults(response.data);
      
      // Complete the step after a short delay
      setTimeout(() => {
        onComplete(response.data);
        navigate('/report');
      }, 1000);

    } catch (err) {
      setError(err.response?.data?.detail || 'Outlier detection failed');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendedMethod = (column) => {
    // Simple recommendation logic based on column name patterns
    if (column.includes('age') || column.includes('count') || column.includes('size')) {
      return 'iqr';
    } else if (column.includes('income') || column.includes('expenditure') || column.includes('amount')) {
      return 'zscore';
    } else {
      return 'isolation_forest';
    }
  };

  const getConfidenceScore = (column, method) => {
    const recommended = getRecommendedMethod(column);
    if (method === recommended) return 0.9;
    if (method === 'iqr' && recommended === 'zscore') return 0.8;
    if (method === 'zscore' && recommended === 'iqr') return 0.8;
    return 0.7;
  };

  const getNumericalColumns = () => {
    // Filter for columns that are likely numerical
    const numericalPatterns = ['age', 'income', 'expenditure', 'amount', 'count', 'size', 'price', 'value'];
    return fileData.columns?.filter(col => 
      numericalPatterns.some(pattern => col.toLowerCase().includes(pattern))
    ) || [];
  };

  if (!fileData || !selectedTemplate || !schemaMappings || !validationResults || !edaResults || !imputationResults) {
    return (
      <div className="main-content">
        <Alert variant="warning">
          <strong>Missing data!</strong> Please complete previous steps first.
        </Alert>
      </div>
    );
  }

  const numericalColumns = getNumericalColumns();

  return (
    <div className="main-content">
      <Card className="card-custom">
        <Card.Header className="text-center">
          <h2>🎯 Outlier Detection</h2>
          <p className="text-muted">Identify and handle outliers in your dataset</p>
        </Card.Header>
        <Card.Body>
          <div className="mb-4">
            <h5>📋 Detection Methods</h5>
            <Row>
              {outlierMethods.map((method) => (
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
                          {method.threshold}
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <Badge bg="warning" text="dark" className="small">
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
            <h5>📊 Select Numerical Columns</h5>
            <p className="text-muted">Choose which numerical columns to analyze for outliers</p>
            
            <div className="row">
              {numericalColumns.map((column) => {
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
            
            {numericalColumns.length === 0 && (
              <Alert variant="info">
                No numerical columns detected. Outlier detection works best with numerical data.
              </Alert>
            )}
          </div>

          {selectedColumns.length > 0 && selectedMethod && (
            <div className="mb-4">
              <h5>🎯 Detection Summary</h5>
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

          {outlierResults && (
            <div className="mb-4">
              <h5>📊 Detection Results</h5>
              <Alert variant="success" className="alert-custom">
                <h6>✅ Outlier Detection Completed!</h6>
                <p><strong>Method Used:</strong> {outlierResults.method_used}</p>
                <Badge bg="success" className="ms-2">
                  Ready for next step
                </Badge>
              </Alert>

              <div className="mt-3">
                <h6>Detailed Results</h6>
                <Table responsive striped>
                  <thead>
                    <tr>
                      <th>Column</th>
                      <th>Method</th>
                      <th>Outliers Found</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(outlierResults.outlier_results || {}).map(([column, result]) => (
                      <tr key={column}>
                        <td><strong>{column}</strong></td>
                        <td>
                          <Badge bg="info">{result.method}</Badge>
                        </td>
                        <td>
                          <Badge bg={result.outlier_count > 0 ? 'warning' : 'success'}>
                            {result.outlier_count}
                          </Badge>
                        </td>
                        <td>
                          {result.method === 'IQR' && (
                            <small>
                              Bounds: [{result.lower_bound?.toFixed(2)}, {result.upper_bound?.toFixed(2)}]
                            </small>
                          )}
                          {result.method === 'Z-Score' && (
                            <small>Threshold: {result.threshold}</small>
                          )}
                          {result.method === 'Isolation Forest' && (
                            <small>Contamination: {result.contamination}</small>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
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
              onClick={handleOutlierDetection}
              disabled={!selectedColumns.length || !selectedMethod || loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner me-2"></span>
                  Detecting Outliers...
                </>
              ) : (
                'Detect Outliers'
              )}
            </Button>
          </div>

          <div className="mt-4">
            <h5>💡 Outlier Detection Guidelines</h5>
            <ul className="text-muted">
              <li><strong>IQR Method:</strong> Robust, works well with skewed data</li>
              <li><strong>Z-Score:</strong> Best for normally distributed data</li>
              <li><strong>Isolation Forest:</strong> Advanced ML method for complex patterns</li>
              <li>Consider the context - some outliers may be valid data points</li>
              <li>Review results before making decisions about outlier handling</li>
            </ul>
          </div>

          <div className="mt-4">
            <h5>🔍 What Happens Next</h5>
            <p className="text-muted">
              After outlier detection, you'll be able to generate a comprehensive report using AI-powered 
              analysis. This will summarize all the preprocessing steps and provide insights about your data.
            </p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default OutlierDetection;




