import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ArrowUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const areaChartData = [
  { name: "Jan", value: 32.4 },
  { name: "Feb", value: 28.6 },
  { name: "Mar", value: 35.2 },
  { name: "Apr", value: 31.8 },
  { name: "May", value: 38.2 },
  { name: "Jun", value: 32.4 },
];

const donutData = [
  { name: "United States", value: 85 },
  { name: "Japan", value: 70 },
  { name: "Indonesia", value: 45 },
  { name: "South Korea", value: 38 },
];

const COLORS = ['#8B5CF6', '#6366F1', '#EC4899', '#F43F5E'];

const Chart = () => {
  const isMobile = useIsMobile();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Analytic</h3>
        </div>
        <div>
          <div className="flex justify-between mb-4">
            <div>
              <h5 className="text-3xl font-bold text-green-500">32.4k</h5>
            </div>
            <div className="flex items-center text-green-500 font-semibold">
              12%
              <ArrowUp className="w-4 h-4 ml-1" />
            </div>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#9B87F5"
                  fill="#9B87F580"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Session by Country</h3>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-3">
          {donutData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm">{item.name}</span>
              <span className="text-sm">{item.value}%</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Chart;