'use client';

import { useState } from 'react';
import Modal from './Modal';

interface EmployeeFormProps {
  employee?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    donation?: number;
  };
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function EmployeeForm({ employee, onSuccess, onCancel }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    donation: employee?.donation?.toString() || '0',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const url = employee ? `/api/employees/${employee.id}` : '/api/employees';
      const method = employee ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          donation: parseFloat(formData.donation) || 0,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.error || 'An error occurred' });
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred while saving' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formatted = name === 'name'
      ? value.charAt(0).toUpperCase() + value.slice(1)
      : value;
    setFormData(prev => ({
      ...prev,
      [name]: formatted,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const inputClass = (hasError?: boolean) =>
    `w-full px-3 py-1.5 rounded-lg border bg-gray-50 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition ${
      hasError ? 'border-red-400 bg-red-50' : 'border-gray-200'
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="name" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Name</label>
        <input
          type="text" id="name" name="name"
          value={formData.name} onChange={handleChange}
          className={inputClass(!!errors.name)}
          placeholder="Enter employee name"
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</label>
        <input
          type="email" id="email" name="email"
          value={formData.email} onChange={handleChange}
          className={inputClass(!!errors.email)}
          placeholder="Enter employee email"
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone <span className="normal-case font-normal text-gray-400">(Optional)</span></label>
        <input
          type="tel" id="phone" name="phone"
          value={formData.phone} onChange={handleChange}
          className={inputClass()}
          placeholder="Enter employee phone number"
        />
      </div>

      <div>
        <label htmlFor="donation" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Donation (₹)</label>
        <input
          type="number" id="donation" name="donation" step="0.01" min="0"
          value={formData.donation} onChange={handleChange}
          className={inputClass()}
          placeholder="Enter donation amount"
        />
      </div>

      {errors.submit && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5">{errors.submit}</p>}

      <div className="flex gap-2 pt-1">
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        )}
        <button type="submit" disabled={isSubmitting}
          className="flex-1 px-3 py-1.5 rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (employee ? 'Updating...' : 'Creating...') : (employee ? 'Update Employee' : 'Add Employee')}
        </button>
      </div>
    </form>
  );
}
