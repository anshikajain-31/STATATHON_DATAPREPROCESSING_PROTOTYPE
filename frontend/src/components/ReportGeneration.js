import React, { useState } from 'react';
import { Card, Button, Alert, Badge, Row, Col, ProgressBar, Table } from 'react-bootstrap';
import axios from 'axios';

const ReportGeneration = ({ 
  fileData, 
  selectedTemplate, 
  schemaMappings, 
  validationResults, 
  edaResults, 
  imputationResults, 
  outlierResults 
}) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      // Simulate progress for report generation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 500);

      const response = await axios.post('/generate-report');
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setReportData(response.data);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Report generation failed');
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const downloadDataset = async (format) => {
    setDownloadProgress(0);
    
    try {
      const response = await axios.get(`/download/${format}`, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setDownloadProgress(progress);
        }
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `processed_data.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setDownloadProgress(100);
      
    } catch (err) {
      setError('Download failed');
    }
  };

  const getProcessingSummary = () => {
    const summary = [];
    
    if (fileData) {
      summary.push({
        step: 'File Upload',
        status: 'Completed',
        details: `${fileData.columns?.length || 0} columns, ${fileData.rows || 0} rows`
      });
    }
    
    if (selectedTemplate) {
      summary.push({
        step: 'Template Selection',
        status: 'Completed',
        details: `${selectedTemplate} template selected`
      });
    }
    
    if (schemaMappings) {
      const highConfidence = schemaMappings.filter(m => m.confidence_score >= 0.8).length;
      summary.push({
        step: 'Schema Mapping',
        status: 'Completed',
        details: `${highConfidence}/${schemaMappings.length} high confidence mappings`
      });
    }
    
    if (validationResults) {
      summary.push({
        step: 'Data Validation',
        status: 'Completed',
        details: `${validationResults.rows_removed || 0} invalid rows removed`
      });
    }
    
    if (edaResults) {
      summary.push({
        step: 'Exploratory Analysis',
        status: 'Completed',
        details: 'EDA report generated'
      });
    }
    
    if (imputationResults) {
      summary.push({
        step: 'Missing Value Imputation',
        status: 'Completed',
        details: 'Imputation applied'
      });
    }
    
    if (outlierResults) {
      summary.push({
        step: 'Outlier Detection',
        status: 'Completed',
        details: 'Outliers identified'
      });
    }
    
    return summary;
  };

  const canGenerateReport = fileData && selectedTemplate && schemaMappings && 
                           validationResults && edaResults && imputationResults && outlierResults;

  if (!canGenerateReport) {
    return (
      <div className="main-content">
        <Alert variant="warning">
          <strong>Missing data!</strong> Please complete all previous steps first.
        </Alert>
      </div>
    );
  }

  const processingSummary = getProcessingSummary();

  return (
    <div className="main-content">
      <Card className="card-custom">
        <Card.Header className="text-center">
          <h2>📋 AI-Powered Report Generation</h2>
          <p className="text-muted">Generate comprehensive reports and download your processed data</p>
        </Card.Header>
        <Card.Body>
          <div className="mb-4">
            <h5>📊 Processing Summary</h5>
            <Table responsive striped>
              <thead>
                <tr>
                  <th>Step</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {processingSummary.map((item, index) => (
                  <tr key={index}>
                    <td><strong>{item.step}</strong></td>
                    <td>
                      <Badge bg="success">{item.status}</Badge>
                    </td>
                    <td>{item.details}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="mb-4">
            <h5>🤖 AI Report Generation</h5>
            <p className="text-muted">
              Generate a comprehensive report using Gemini AI that summarizes all preprocessing steps, 
              provides insights, and creates a professional PDF document.
            </p>
            
            <Row>
              <Col md={6}>
                <Card className="border-info">
                  <Card.Body>
                    <h6>📝 Report Contents</h6>
                    <ul className="text-muted small">
                      <li>Dataset overview and statistics</li>
                      <li>Summary of preprocessing steps</li>
                      <li>Data quality insights</li>
                      <li>Recommendations and next steps</li>
                      <li>Professional PDF format</li>
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="border-success">
                  <Card.Body>
                    <h6>🔧 Technical Features</h6>
                    <ul className="text-muted small">
                      <li>Gemini AI-powered analysis</li>
                      <li>Automatic PDF generation</li>
                      <li>Professional formatting</li>
                      <li>Downloadable reports</li>
                      <li>Comprehensive documentation</li>
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>

          {loading && (
            <div className="mb-4">
              <h6>Generating AI Report...</h6>
              <ProgressBar 
                now={progress} 
                className="progress-bar"
                label={`${progress}%`}
              />
              <p className="text-center mt-2">
                {progress < 100 ? 'Analyzing data and generating insights...' : 'Finalizing PDF report...'}
              </p>
            </div>
          )}

          {reportData && (
            <div className="mb-4">
              <Alert variant="success" className="alert-custom">
                <h5>✅ AI Report Generated Successfully!</h5>
                <p><strong>PDF Report:</strong> {reportData.pdf_path}</p>
                <p><strong>AI Summary:</strong> {reportData.summary.substring(0, 200)}...</p>
                <Badge bg="success" className="ms-2">
                  Report Ready
                </Badge>
              </Alert>

              <div className="download-section">
                <h6>📥 Download Options</h6>
                <div className="d-flex gap-2 flex-wrap">
                  <Button 
                    variant="outline-primary" 
                    className="download-btn"
                    onClick={() => window.open('http://localhost:8000/download/pdf', '_blank')}
                  >
                    📋 Download PDF Report
                  </Button>
                  <Button 
                    variant="outline-success" 
                    className="download-btn"
                    onClick={() => window.open('http://localhost:8000/download/pdf', '_blank')}
                  >
                    💾 Save PDF Report
                  </Button>
                </div>
                
                <div className="mt-3">
                  <h6>📋 Report Summary</h6>
                  <p><strong>AI Summary:</strong> {reportData.summary.substring(0, 200)}...</p>
                  <p><strong>Total Steps:</strong> {reportData.steps?.length || 0} processing steps completed</p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-4">
            <h5>💾 Download Processed Data</h5>
            <p className="text-muted">
              Download your cleaned and processed dataset in various formats for further analysis.
            </p>
            
            <Row className="text-center">
              <Col md={4}>
                <Button
                  variant="outline-success"
                  size="lg"
                  className="download-btn w-100"
                  onClick={() => downloadDataset('csv')}
                  disabled={downloadProgress > 0 && downloadProgress < 100}
                >
                  📊 Download CSV
                </Button>
              </Col>
              <Col md={4}>
                <Button
                  variant="outline-info"
                  size="lg"
                  className="download-btn w-100"
                  onClick={() => downloadDataset('excel')}
                  disabled={downloadProgress > 0 && downloadProgress < 100}
                >
                  📈 Download Excel
                </Button>
              </Col>
              <Col md={4}>
                <Button
                  variant="outline-warning"
                  size="lg"
                  className="download-btn w-100"
                  onClick={() => downloadDataset('csv')}
                  disabled={downloadProgress > 0 && downloadProgress < 100}
                >
                  🔄 Download JSON
                </Button>
              </Col>
            </Row>

            {downloadProgress > 0 && downloadProgress < 100 && (
              <div className="mt-3">
                <ProgressBar 
                  now={downloadProgress} 
                  className="progress-bar"
                  label={`${downloadProgress}%`}
                />
                <p className="text-center mt-2">Downloading...</p>
              </div>
            )}
          </div>

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
              onClick={generateReport}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner me-2"></span>
                  Generating AI Report...
                </>
              ) : (
                'Generate AI Report'
              )}
            </Button>
          </div>

          <div className="mt-4">
            <h5>🎉 Congratulations!</h5>
            <p className="text-muted">
              You've successfully completed the entire data preparation workflow! Your dataset has been:
            </p>
            <ul className="text-muted">
              <li>✅ Uploaded and validated</li>
              <li>✅ Mapped to a professional template</li>
              <li>✅ Cleaned and validated</li>
              <li>✅ Analyzed with comprehensive EDA</li>
              <li>✅ Enhanced with missing value imputation</li>
              <li>✅ Processed for outlier detection</li>
              <li>✅ Documented with AI-powered insights</li>
            </ul>
          </div>

          <div className="mt-4">
            <h5>🚀 Next Steps</h5>
            <p className="text-muted">
              Your data is now ready for advanced analytics, machine learning, or business intelligence applications. 
              Consider using the processed dataset for:
            </p>
            <ul className="text-muted">
              <li>Statistical modeling and analysis</li>
              <li>Machine learning model training</li>
              <li>Business intelligence dashboards</li>
              <li>Research and academic studies</li>
              <li>Compliance and audit reporting</li>
            </ul>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ReportGeneration;
