import React, { useState } from 'react';
import { Calculator, X, Calendar, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

interface AgeCalculatorModalProps {
  onClose: () => void;
}

export const AgeCalculatorModal: React.FC<AgeCalculatorModalProps> = ({ onClose }) => {
  const [dob, setDob] = useState<string>('2000-01-01');
  const [targetDate, setTargetDate] = useState<string>('2026-08-01');
  const [minAgeInput, setMinAgeInput] = useState<number>(18);
  const [maxAgeInput, setMaxAgeInput] = useState<number>(30);

  const calculateAge = () => {
    if (!dob || !targetDate) return null;

    const birth = new Date(dob);
    const target = new Date(targetDate);

    if (isNaN(birth.getTime()) || isNaN(target.getTime()) || birth > target) {
      return null;
    }

    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      // Get days in previous month
      const prevMonthLastDay = new Date(target.getFullYear(), target.getMonth(), 0).getDate();
      days += prevMonthLastDay;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const totalDays = Math.floor((target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));

    return { years, months, days, totalDays };
  };

  const ageResult = calculateAge();

  const isEligible = ageResult
    ? ageResult.years >= minAgeInput && ageResult.years <= maxAgeInput
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-blue-900 text-white p-4 flex items-center justify-between border-b border-blue-800">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Job Eligibility Age Calculator</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-blue-800 rounded text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs text-slate-700">
          <p className="text-slate-500 leading-relaxed">
            Quickly check your exact age as on the official recruitment cut-off date.
          </p>

          <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Date of Birth (DOB):
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Age Cut-Off Date (As on Date):
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Min Age Limit:</label>
                <input
                  type="number"
                  value={minAgeInput}
                  onChange={(e) => setMinAgeInput(Number(e.target.value))}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded-md font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Max Age Limit:</label>
                <input
                  type="number"
                  value={maxAgeInput}
                  onChange={(e) => setMaxAgeInput(Number(e.target.value))}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded-md font-bold"
                />
              </div>
            </div>
          </div>

          {/* Results Display */}
          {ageResult ? (
            <div className="space-y-3">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-center space-y-1">
                <span className="text-xs text-blue-800 font-bold uppercase tracking-wider block">
                  Your Calculated Age
                </span>
                <div className="text-2xl font-black text-blue-900">
                  {ageResult.years} <span className="text-sm font-medium">Years</span>{' '}
                  {ageResult.months} <span className="text-sm font-medium">Months</span>{' '}
                  {ageResult.days} <span className="text-sm font-medium">Days</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Total days lived: {ageResult.totalDays.toLocaleString()} days
                </p>
              </div>

              {/* Eligibility Badge */}
              <div
                className={`p-3 rounded-xl border flex items-center gap-3 ${
                  isEligible
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                {isEligible ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm">YOU ARE ELIGIBLE!</h4>
                      <p className="text-[11px] text-emerald-700">
                        Your age ({ageResult.years} yrs) lies between {minAgeInput} and {maxAgeInput} years.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm">AGE OUT OF RANGE</h4>
                      <p className="text-[11px] text-rose-700">
                        Your age ({ageResult.years} yrs) does not meet the {minAgeInput}-{maxAgeInput} years criteria. Check age relaxation rules!
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-rose-600 italic">
              Please enter a valid Date of Birth prior to the cut-off date.
            </p>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                setDob('2000-01-01');
                setTargetDate('2026-08-01');
              }}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800"
            >
              Close Calculator
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
