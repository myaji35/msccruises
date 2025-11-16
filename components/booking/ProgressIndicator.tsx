'use client';

import React from 'react';

interface Step {
  number: number;
  title: string;
  description: string;
}

interface ProgressIndicatorProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const steps: Step[] = [
  { number: 1, title: '항해 선택', description: 'Choose Your Cruise' },
  { number: 2, title: '객실 선택', description: 'Select Cabin' },
  { number: 3, title: '추가 옵션', description: 'Add Extras' },
  { number: 4, title: '결제', description: 'Payment' },
];

export default function ProgressIndicator({
  currentStep,
  onStepClick,
}: ProgressIndicatorProps) {
  return (
    <div className="w-full bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-2 md:px-4 py-3 md:py-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              {/* Step */}
              <div className="flex flex-col items-center flex-1">
                <button
                  onClick={() => onStepClick && onStepClick(step.number)}
                  disabled={step.number > currentStep}
                  className={`
                    relative flex items-center justify-center
                    w-8 h-8 md:w-12 md:h-12 rounded-full font-semibold text-sm md:text-lg
                    transition-all duration-300
                    ${
                      step.number < currentStep
                        ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600 active:bg-green-700'
                        : step.number === currentStep
                        ? 'bg-blue-600 text-white ring-2 md:ring-4 ring-blue-200'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {step.number < currentStep ? (
                    <svg
                      className="w-4 h-4 md:w-6 md:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step.number
                  )}
                </button>

                <div className="mt-1.5 md:mt-3 text-center">
                  <div
                    className={`
                    text-xs md:text-sm font-medium
                    ${
                      step.number <= currentStep
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }
                  `}
                  >
                    {step.title}
                  </div>
                  <div
                    className={`
                    text-[10px] md:text-xs mt-0.5 md:mt-1 hidden sm:block
                    ${
                      step.number <= currentStep
                        ? 'text-gray-500'
                        : 'text-gray-300'
                    }
                  `}
                  >
                    {step.description}
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 md:h-1 mx-1 md:mx-4 mt-[-40px] md:mt-[-60px]">
                  <div
                    className={`
                    h-full rounded transition-all duration-300
                    ${
                      step.number < currentStep
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }
                  `}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
