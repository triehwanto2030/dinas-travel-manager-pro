
import React from 'react';
import { Progress } from '@/components/ui/progress';

const BudgetOverview = () => {
  const budgetItems = [
    { label: 'Budget Transportasi', percentage: 75, color: 'bg-blue-500' },
    { label: 'Budget Akomodasi', percentage: 60, color: 'bg-green-500' },
    { label: 'Budget Konsumsi', percentage: 45, color: 'bg-yellow-500' },
    { label: 'Budget Lain-lain', percentage: 30, color: 'bg-purple-500' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        📊 Overview Budget
      </h3>
      <div className="space-y-4">
        {budgetItems.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.percentage}%</span>
            </div>
            <Progress value={item.percentage} className="h-2" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetOverview;
