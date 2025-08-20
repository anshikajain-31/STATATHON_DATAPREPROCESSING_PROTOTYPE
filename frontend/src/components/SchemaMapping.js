import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Alert, Form, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SchemaMapping = ({ onComplete, fileData, selectedTemplate }) => {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mappingComplete, setMappingComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedTemplate) {
      performSchemaMapping();
    }
  }, [selectedTemplate]);

  const performSchemaMapping = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('template_name', selectedTemplate);
      
      const response = await axios.post('/map-schema', formData);
      setMappings(response.data.mappings);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to perform schema mapping');
    } finally {
      setLoading(false);
    }
  };

  const handleMappingChange = (templateColumn, newDataColumn) => {
    setMappings(prev => 
      prev.map(mapping => 
        mapping.template_column === templateColumn 
          ? { ...mapping, mapped_column: newDataColumn }
          : mapping
      )
    );
  };

  const getConfidenceClass = (score) => {
    if (score >= 0.8) return 'confidence-high';
    if (score >= 0.5) return 'confidence-medium';
    return 'confidence-low';
  };

  const getConfidenceLabel = (score) => {
    if (score >= 0.8) return 'High';
    if (score >= 0.5) return 'Medium';
    return 'Low';
  };

  const handleContinue = () => {
    if (mappings.length > 0) {
      onComplete(mappings);
      navigate('/validation');
    }
  };

  const getMappingStats = () => {
    const highConfidence = mappings.filter(m => m.confidence_score >= 0.8).length;
    const mediumConfidence = mappings.filter(m => m.confidence_score >= 0.5 && m.confidence_score < 0.8).length;
    const lowConfidence = mappings.filter(m => m.confidence_score < 0.5).length;
    
    return { highConfidence, mediumConfidence, lowConfidence };
  };

  if (!fileData || !selectedTemplate) {
    return (
      <div className="main-content">
        <Alert variant="warning">
          <strong>Missing data!</strong> Please complete previous steps first.
        </Alert>
      </div>
    );
  }

  const stats = getMappingStats();

  return (
    <div className="main-content">
      <Card className="card-custom">
        <Card.Header className="text-center">
          <h2>🔗 Schema Mapping</h2>
          <p className="text-muted">Map your data columns to the selected template structure</p>
        </Card.Header>
        <Card.Body>
          <div className="mb-4">
            <h5>📊 Mapping Summary</h5>
            <Row className="text-center">
              <Col md={4}>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <h6 className="text-success">High Confidence</h6>
                  <Badge bg="success" className="fs-5">{stats.highConfidence}</Badge>
                </div>
              </Col>
              <Col md={4}>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <h6 className="text-warning">Medium Confidence</h6>
                  <Badge bg="warning" className="fs-5">{stats.mediumConfidence}</Badge>
                </div>
              </Col>
              <Col md={4}>
                <div className="bg-danger bg-opacity-10 p-3 rounded">
                  <h6 className="text-danger">Low Confidence</h6>
                  <Badge bg="danger" className="fs-5">{stats.lowConfidence}</Badge>
                </div>
              </Col>
            </Row>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="loading-spinner mb-3"></div>
              <p>Performing intelligent schema mapping...</p>
            </div>
          ) : mappings.length > 0 ? (
            <div className="mapping-table">
              <Table responsive striped>
                <thead>
                  <tr>
                    <th>Template Column</th>
                    <th>Mapped Data Column</th>
                    <th>Confidence Score</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mappings.map((mapping, index) => (
                    <tr key={index}>
                      <td>
                        <strong>{mapping.template_column}</strong>
                        <br />
                        <small className="text-muted">Template field</small>
                      </td>
                      <td>
                        <Form.Select
                          value={mapping.mapped_column || ''}
                          onChange={(e) => handleMappingChange(mapping.template_column, e.target.value)}
                          className="form-control-custom"
                        >
                          <option value="">Select column...</option>
                          {mapping.available_columns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </Form.Select>
                      </td>
                      <td>
                        <Badge 
                          bg={mapping.confidence_score >= 0.8 ? 'success' : 
                              mapping.confidence_score >= 0.5 ? 'warning' : 'danger'}
                          className={getConfidenceClass(mapping.confidence_score)}
                        >
                          {getConfidenceLabel(mapping.confidence_score)} ({mapping.confidence_score})
                        </Badge>
                      </td>
                      <td>
                        {mapping.confidence_score < 0.8 && (
                          <Badge bg="warning" text="dark">
                            Review Recommended
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <Alert variant="info">
              No mappings available. Please try again.
            </Alert>
          )}

          {error && (
            <Alert variant="danger" className="alert-custom mt-3">
              <strong>Error:</strong> {error}
            </Alert>
          )}

          <div className="mt-4">
            <h5>💡 Mapping Tips</h5>
            <ul className="text-muted">
              <li><strong>High Confidence (≥0.8):</strong> Automatic mapping is reliable</li>
              <li><strong>Medium Confidence (0.5-0.8):</strong> Review and adjust if needed</li>
              <li><strong>Low Confidence (&lt;0.5):</strong> Manual mapping required</li>
              <li>Use the dropdown to manually change any mapping</li>
              <li>Ensure all required template columns are mapped</li>
            </ul>
          </div>

          <div className="d-grid gap-2 mt-4">
            <Button
              variant="primary"
              size="lg"
              className="btn-custom"
              onClick={handleContinue}
              disabled={mappings.length === 0 || loading}
            >
              Continue to Data Validation
            </Button>
          </div>

          <div className="mt-4">
            <h5>🔄 Remap Schema</h5>
            <Button
              variant="outline-secondary"
              onClick={performSchemaMapping}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner me-2"></span>
                  Remapping...
                </>
              ) : (
                'Perform New Mapping'
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SchemaMapping;
