import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from 'react-bootstrap';

const StepIndicator = ({ steps, currentStep, canAccessStep }) => {
  const navigate = useNavigate();

  const getStepStatus = (step) => {
    if (step.id < currentStep) return 'completed';
    if (step.id === currentStep) return 'active';
    return 'pending';
  };

  const handleStepClick = (step) => {
    if (canAccessStep(step.id)) {
      navigate(step.path);
    }
  };

  return (
    <div className="step-indicator">
      {steps.map((step, index) => (
        <div key={step.id} className="step">
          <div
            className={`step-number ${getStepStatus(step)}`}
            onClick={() => handleStepClick(step)}
            style={{ cursor: canAccessStep(step.id) ? 'pointer' : 'not-allowed' }}
          >
            {step.id < currentStep ? '✓' : step.id}
          </div>
          <div className="step-info">
            <div className="step-name">{step.name}</div>
            <Badge 
              bg={getStepStatus(step) === 'completed' ? 'success' : 
                  getStepStatus(step) === 'active' ? 'primary' : 'secondary'}
              className="step-status"
            >
              {getStepStatus(step)}
            </Badge>
          </div>
          {index < steps.length - 1 && (
            <div className="step-connector">
              <div className="connector-line"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;




