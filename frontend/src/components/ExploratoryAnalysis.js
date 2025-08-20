import React, { useState } from 'react';
import { Card, Button, Alert, Badge, Row, Col, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ExploratoryAnalysis = ({ onComplete, fileData, selectedTemplate, schemaMappings, validationResults }) => {
  const [edaResults, setEdaResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const generateEDA = async () => {
    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const response = await axios.post('/eda');
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setEdaResults(response.data);
      
      // Complete the step after a short delay
      setTimeout(() => {
        onComplete(response.data);
        // navigate('/imputation'); // Remove or comment this out
      }, 1000);

    } catch (err) {
      setError(err.response?.data?.detail || 'EDA generation failed');
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  if (!fileData || !selectedTemplate || !schemaMappings || !validationResults) {
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
          <h2>📊 Exploratory Data Analysis</h2>
          <p className="text-muted">Generate comprehensive insights about your dataset</p>
        </Card.Header>
        <Card.Body>
          <div className="mb-4">
            <h5>📋 Analysis Overview</h5>
            <Row className="text-center">
              <Col md={4}>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <h6 className="text-info">Data Shape</h6>
                  <Badge bg="info" className="fs-5">
                    {validationResults.remaining_rows || 0} × {fileData.columns?.length || 0}
                  </Badge>
                </div>
              </Col>
              <Col md={4}>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <h6 className="text-success">Template</h6>
                  <Badge bg="success" className="fs-5 text-capitalize">
                    {selectedTemplate}
                  </Badge>
                </div>
              </Col>
              <Col md={4}>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <h6 className="text-warning">Mappings</h6>
                  <Badge bg="warning" className="fs-5">
                    {schemaMappings.length}
                  </Badge>
                </div>
              </Col>
            </Row>
          </div>

          <div className="mb-4">
            <h5>🔍 What EDA Will Generate</h5>
            <Row>
              <Col md={6}>
                <Card className="border-info">
                  <Card.Body>
                    <h6>📈 Statistical Analysis</h6>
                    <ul className="text-muted small">
                      <li>Descriptive statistics for each column</li>
                      <li>Data type information and distributions</li>
                      <li>Missing value analysis</li>
                      <li>Correlation matrices</li>
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="border-success">
                  <Card.Body>
                    <h6>📊 Visualizations</h6>
                    <ul className="text-muted small">
                      <li>Histograms and box plots</li>
                      <li>Scatter plots for correlations</li>
                      <li>Missing value heatmaps</li>
                      <li>Distribution comparisons</li>
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>

          {loading && (
            <div className="mb-4">
              <h6>Generating EDA Report...</h6>
              <ProgressBar 
                now={progress} 
                className="progress-bar"
                label={`${progress}%`}
              />
              <p className="text-center mt-2">
                {progress < 100 ? 'Analyzing data...' : 'Finalizing report...'}
              </p>
            </div>
          )}

          {edaResults && (
            <div className="mb-4">
              <Alert variant="success" className="alert-custom">
                <h5>✅ EDA Report Generated Successfully!</h5>
                <p><strong>Report:</strong> {edaResults.report_path}</p>
                <p><strong>Data Shape:</strong> {edaResults.data_shape}</p>
                <p><strong>Columns Analyzed:</strong> {edaResults.columns?.length || 0}</p>
                <Badge bg="success" className="ms-2">
                  Ready for next step
                </Badge>
              </Alert>

              <div className="download-section">
                <h6>📥 Download & View Options</h6>
                <div className="d-flex gap-2 flex-wrap">
                  <Button 
                    variant="outline-primary" 
                    className="download-btn"
                    onClick={() => window.open('http://localhost:8000/eda-report', '_blank')}
                  >
                    📊 View EDA Report
                  </Button>
                  <Button 
                    variant="outline-success" 
                    className="download-btn"
                    onClick={() => window.open('http://localhost:8000/eda-report', '_blank')}
                  >
                    💾 Download HTML Report
                  </Button>
                </div>
                
                <div className="mt-3">
                  <h6>📋 EDA Summary</h6>
                  <Row>
                    <Col md={6}>
                      <p><strong>Numeric Columns:</strong> {edaResults.eda_summary?.numeric_columns ? Object.keys(edaResults.eda_summary.numeric_columns).length : 0}</p>
                      <p><strong>Categorical Columns:</strong> {edaResults.eda_summary?.categorical_columns ? Object.keys(edaResults.eda_summary.categorical_columns).length : 0}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Total Missing Values:</strong> {edaResults.eda_summary?.missing_values ? Object.values(edaResults.eda_summary.missing_values).reduce((a, b) => a + b, 0) : 0}</p>
                      <p><strong>Memory Usage:</strong> {edaResults.eda_summary?.overview?.memory_usage ? `${(edaResults.eda_summary.overview.memory_usage / 1024).toFixed(2)} KB` : 'N/A'}</p>
                    </Col>
                  </Row>
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
              onClick={generateEDA}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner me-2"></span>
                  Generating EDA...
                </>
              ) : (
                'Generate EDA Report'
              )}
            </Button>
          </div>

          <div className="mt-4">
            <h5>💡 EDA Benefits</h5>
            <ul className="text-muted">
              <li><strong>Data Understanding:</strong> Get insights into your dataset structure</li>
              <li><strong>Quality Assessment:</strong> Identify data quality issues and patterns</li>
              <li><strong>Feature Analysis:</strong> Understand relationships between variables</li>
              <li><strong>Decision Support:</strong> Make informed choices for next steps</li>
              <li><strong>Documentation:</strong> Professional report for stakeholders</li>
            </ul>
          </div>

          <div className="mt-4">
            <h5>🔧 Technical Details</h5>
            <p className="text-muted">
              This analysis uses <strong>ydata-profiling</strong> (formerly pandas-profiling) to generate 
              comprehensive reports including statistical summaries, visualizations, and data quality metrics. 
              The report is generated as an interactive HTML file that you can view in any web browser.
            </p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ExploratoryAnalysis;
