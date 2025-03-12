
import React from "react";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  description?: string;
  icon: LucideIcon;
  gradient: string;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  description,
  icon: Icon,
  gradient,
  iconColor,
}) => {
  return (
    <Card className={`p-6 shadow-lg border-0 rounded-xl overflow-hidden bg-gradient-to-br ${gradient} dark:from-gray-800 dark:to-gray-700 border-opacity-20 dark:border-gray-600`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl font-bold">
            {value}
          </h3>
          {change && (
            <div className="flex items-center mt-2 text-sm">
              <span className={isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                {change}
              </span>
              {isPositive ? (
                <ArrowUpRight className="h-4 w-4 ml-1 text-green-600 dark:text-green-400" />
              ) : (
                <ArrowDownRight className="h-4 w-4 ml-1 text-red-600 dark:text-red-400" />
              )}
            </div>
          )}
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className={`p-3 rounded-full shadow-inner bg-opacity-50 ${iconColor.replace('text-', 'bg-').replace('-600', '-100')} dark:bg-opacity-20`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
