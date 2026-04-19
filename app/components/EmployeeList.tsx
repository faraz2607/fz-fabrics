'use client';

import { useState, useEffect } from 'react';
import EmployeeForm from './EmployeeForm';
import ConfirmationModal from './ConfirmationModal';
import Modal from './Modal';
import TableSkeleton from './TableSkeleton';
import NoDataFound from './NoDataFound';
import { useRef } from 'react';
interface FabricType {
  id?: string;
  type: string;
  cost: number;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  donation?: number;
  createdAt: string;
}

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Fabric type popup state
  const [showFabricTypeModal, setShowFabricTypeModal] = useState(false);
  const [fabricTypes, setFabricTypes] = useState<FabricType[]>([]);
  const [fabricTypeError, setFabricTypeError] = useState<string | null>(null);
  const fabricTypeRef = useRef<HTMLInputElement>(null);
  const fabricCostRef = useRef<HTMLInputElement>(null);
  // Fetch fabric types from API (to be implemented)
  const fetchFabricTypes = async () => {
    try {
      const res = await fetch('/api/fabrics');
      if (res.ok) {
        setFabricTypes(await res.json());
      }
    } catch {}
  };

  useEffect(() => { fetchFabricTypes(); }, []);
  // Add fabric type handler
  const handleAddFabricType = async (e: React.FormEvent) => {
    e.preventDefault();
    setFabricTypeError(null);
    const type = fabricTypeRef.current?.value.trim() || '';
    const costRaw = fabricCostRef.current?.value;
    const cost = costRaw !== undefined && costRaw !== null && costRaw !== '' ? parseFloat(costRaw) : NaN;
    if (!type || isNaN(cost) || cost <= 0) {
      setFabricTypeError('Type and cost are required and cost must be a positive number.');
      return;
    }
    if (fabricTypes.some(f => f.type.toLowerCase() === type.toLowerCase())) {
      setFabricTypeError('This fabric type already exists.');
      return;
    }
    // Save to DB (API call)
    try {
      const res = await fetch('/api/fabrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, cost })
      });
      if (!res.ok) {
        const data = await res.json();
        setFabricTypeError(data.error || 'Failed to add fabric type.');
        return;
      }
      setShowFabricTypeModal(false);
      if (fabricTypeRef.current) fabricTypeRef.current.value = '';
      if (fabricCostRef.current) fabricCostRef.current.value = '';
      fetchFabricTypes();
    } catch {
      setFabricTypeError('Failed to add fabric type.');
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/employees');
      
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      
      const data = await response.json();
      setEmployees(data.sort((a: Employee, b: Employee) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = () => {
    setShowAddForm(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setDeletingEmployee(employee);
  };

  const handleConfirmDelete = async () => {
    if (!deletingEmployee) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/employees/${deletingEmployee.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEmployees(prev => prev.filter(emp => emp.id !== deletingEmployee.id));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete employee');
      }
    } catch (err) {
      setError('An error occurred while deleting the employee');
    } finally {
      setIsSubmitting(false);
      setDeletingEmployee(null);
    }
  };

  const handleFormSuccess = () => {
    setShowAddForm(false);
    setEditingEmployee(null);
    fetchEmployees();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };



  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black">Employees</h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => window.location.assign('/fabrics')}
              className="inline-flex items-center rounded-lg bg-green-600 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Manage Fabrics
            </button>
            <button
              onClick={handleAddEmployee}
              className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Employee
            </button>
          </div>
        </div>
        {/* Add Fabric Type Modal */}
        <Modal isOpen={showFabricTypeModal} onClose={() => setShowFabricTypeModal(false)} title="Add Fabric Type">
          <form onSubmit={handleAddFabricType} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Fabric Type</label>
              <input ref={fabricTypeRef} type="text" placeholder="e.g. Cotton" className="w-full px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Cost (₹)</label>
              <input ref={fabricCostRef} type="number" min={1} placeholder="Enter cost" className="w-full px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" required />
            </div>
            {fabricTypeError && <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2">{fabricTypeError}</div>}
            <div className="flex gap-2 sm:gap-3 pt-1">
              <button type="button" onClick={() => setShowFabricTypeModal(false)} className="flex-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-gray-200 text-gray-600 text-xs sm:text-sm font-semibold hover:bg-gray-50 transition">Cancel</button>
              <button type="submit" className="flex-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 text-white text-xs sm:text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-sm transition">Add Fabric Type</button>
            </div>
          </form>
        </Modal>

        {error && (
          <div className="mb-3 sm:mb-4 rounded-lg bg-red-50 p-3">
            <div className="text-xs sm:text-sm text-red-700">{error}</div>
          </div>
        )}

        {loading ? (
          <div className="overflow-hidden rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
            <TableSkeleton rows={5} cols={5} />
          </div>
        ) : employees.length === 0 ? (
          <NoDataFound
            title="No employees yet"
            description="Get started by adding your first employee."
            action={{ label: 'Add Employee', onClick: handleAddEmployee }}
          />
        ) : (
          <div className="overflow-hidden rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
            <div className="overflow-x-auto overflow-y-auto max-h-123">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-linear-to-r from-blue-50 to-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Donation</th>
                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {employees.map((employee, idx) => (
                    <tr
                      key={employee.id}
                      className={`cursor-pointer transition-colors hover:bg-blue-50 ${idx % 2 === 1 ? 'bg-gray-50/60' : 'bg-white'}`}
                      onClick={() => window.location.assign(`/employee/${employee.id}`)}
                    >
                      <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900">{employee.name}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500">{employee.email}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500">{employee.phone || '—'}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-green-600">₹{employee.donation?.toFixed(2) || '0.00'}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500">{formatDate(employee.createdAt)}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-medium space-x-2 sm:space-x-3" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleEditEmployee(employee)} className="text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>
                        <button onClick={() => handleDeleteEmployee(employee)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Employee Modal */}
        {showAddForm && (
          <Modal isOpen={showAddForm} onClose={() => setShowAddForm(false)} title="Add Employee">
            <EmployeeForm
              onSuccess={handleFormSuccess}
              onCancel={() => setShowAddForm(false)}
            />
          </Modal>
        )}

        {/* Edit Employee Modal */}
        {editingEmployee && (
          <Modal isOpen={!!editingEmployee} onClose={() => setEditingEmployee(null)} title="Edit Employee">
            <EmployeeForm
              employee={editingEmployee}
              onSuccess={handleFormSuccess}
              onCancel={() => setEditingEmployee(null)}
            />
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={!!deletingEmployee}
          onClose={() => setDeletingEmployee(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Employee"
          message={`Are you sure you want to delete ${deletingEmployee?.name}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          isLoading={isSubmitting}
        />
    </div>
  );
}