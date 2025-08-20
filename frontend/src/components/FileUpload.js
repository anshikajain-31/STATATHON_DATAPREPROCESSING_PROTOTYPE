import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, Button, Alert, ProgressBar, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FileUpload = ({ onComplete }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      // Check file size (50MB limit)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size exceeds 50MB limit');
        return;
      }
      
      // Check file type
      const validTypes = ['.csv', '.json'];
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
      if (!validTypes.includes(fileExtension)) {
        setError('Please upload a CSV or JSON file');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json']
    },
    multiple: false
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setUploadResult(response.data);
      
      // Complete the step after a short delay
      setTimeout(() => {
        onComplete(response.data);
        navigate('/template');
      }, 1000);

    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    if (fileName.endsWith('.csv')) return '📊';
    if (fileName.endsWith('.json')) return '📄';
    return '📁';
  };

  const downloadSampleData = async () => {
    try {
      const response = await axios.get('/sample-data', {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sample_data.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading sample data:', error);
      alert('Failed to download sample data. Please try again.');
    }
  };

  return (
    <div className="main-content">
      <Card className="card-custom">
        <Card.Header className="text-center">
          <h2>📁 File Upload</h2>
          <p className="text-muted">Upload your CSV or JSON file to begin data preparation</p>
          
          <div className="mt-3">
            <h5>💡 Need sample data to test?</h5>
            <p className="text-muted mb-2">Download our sample household consumption dataset to explore the features</p>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={downloadSampleData}
              className="btn-custom"
            >
              📥 Download Sample Data (CSV)
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {!file ? (
            <div
              {...getRootProps()}
              className={`upload-area ${isDragActive ? 'dragover' : ''}`}
            >
              <input {...getInputProps()} />
              <div className="text-center">
                <h3>📁 Drop your file here</h3>
                <p>or click to browse</p>
                <p className="text-muted">
                  Supported formats: CSV, JSON<br />
                  Maximum size: 50MB
                </p>
              </div>
            </div>
          ) : (
            <div className="file-info">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <span className="fs-1 me-3">{getFileIcon(file.name)}</span>
                  <div>
                    <h5 className="mb-1">{file.name}</h5>
                    <p className="mb-0 text-muted">
                      Size: {formatFileSize(file.size)} | 
                      Type: {file.type || 'Unknown'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => setFile(null)}
                  disabled={uploading}
                >
                  Remove
                </Button>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="danger" className="alert-custom mt-3">
              <strong>Error:</strong> {error}
            </Alert>
          )}

          {uploading && (
            <div className="mt-3">
              <ProgressBar 
                now={uploadProgress} 
                className="progress-bar"
                label={`${uploadProgress}%`}
              />
              <p className="text-center mt-2">
                {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
              </p>
            </div>
          )}

          {uploadResult && (
            <Alert variant="success" className="alert-custom mt-3">
              <h5>✅ Upload Successful!</h5>
              <p><strong>File:</strong> {uploadResult.message}</p>
              <p><strong>Columns:</strong> {uploadResult.columns?.length || 0}</p>
              <p><strong>Rows:</strong> {uploadResult.rows || 0}</p>
              <Badge bg="success" className="ms-2">
                Ready for next step
              </Badge>
            </Alert>
          )}

          <div className="d-grid gap-2 mt-4">
            <Button
              variant="primary"
              size="lg"
              className="btn-custom"
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading ? (
                <>
                  <span className="loading-spinner me-2"></span>
                  Uploading...
                </>
              ) : (
                'Upload & Continue'
              )}
            </Button>
          </div>

          <div className="mt-4">
            <h5>📋 What happens next?</h5>
            <ul className="text-muted">
              <li>Your file will be processed and converted to CSV if needed</li>
              <li>File validation and size checks will be performed</li>
              <li>You'll be able to select a template for your data</li>
              <li>Schema mapping will help organize your columns</li>
            </ul>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default FileUpload;
