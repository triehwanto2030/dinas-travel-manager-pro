import React from 'react';
import { Progress } from '@/components/ui/progress';

const BudgetOverview = () => {
  const budgetItems = [
    { label: 'Transportasi', percentage: 75, color: 'from-primary to-primary/70' },
    { label: 'Akomodasi', percentage: 60, color: 'from-[hsl(142,71%,45%)] to-[hsl(142,71%,35%)]' },
    { label: 'Konsumsi', percentage: 45, color: 'from-[hsl(38,92%,50%)] to-[hsl(38,80%,40%)]' },
    { label: 'Lain-lain', percentage: 30, color: 'from-[hsl(280,70%,50%)] to-[hsl(280,60%,40%)]' }
  ];

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-base font-bold text-foreground mb-5 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary" />
        Overview Budget
      </h3>
      <div className="space-y-5">
        {budgetItems.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">{item.label}</span>
              <span className="text-sm font-bold text-foreground">{item.percentage}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-500`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetOverview;
