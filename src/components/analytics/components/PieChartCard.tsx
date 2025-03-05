
import { Card } from "@/components/ui/card";
import { COLORS } from "../data/demoData";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from "recharts";
import { Progress } from "@/components/ui/progress";

interface PieChartCardProps {
  title: string;
  icon: React.ReactNode;
  data: Array<{
    name: string;
    value: number;
  }>;
  loading?: boolean; // Added loading prop as optional
}

const PieChartCard = ({ title, icon, data, loading = false }: PieChartCardProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="bg-red-100 dark:bg-red-900/60 p-2 rounded-md">
          {icon}
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-6">
          <div className="h-[200px] flex items-center justify-center">
            <div className="w-40">
              <Progress value={75} className="h-2 mb-2" />
              <p className="text-sm text-center text-muted-foreground">Загрузка данных...</p>
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-full mr-2"></div>
                  <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value.toLocaleString()} ₽`, '']}
                  contentStyle={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e5e7eb' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm">{item.name}</span>
                </div>
                <span className="font-medium">{item.value.toLocaleString()} ₽</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default PieChartCard;
