
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

interface DataItem {
  name: string;
  value: number;
  count?: number;
}

interface PieChartCardProps {
  title: string;
  icon: React.ReactNode;
  data: DataItem[];
}

const COLORS = [
  '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', 
  '#d0ed57', '#ffc658', '#ff8042', '#ff6361', '#bc5090'
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium">{data.name}</p>
        <p>Сумма: {data.value.toLocaleString()} ₽</p>
        {data.count !== undefined && (
          <p>Количество: {data.count}</p>
        )}
      </div>
    );
  }
  return null;
};

const PieChartCard = ({ title, icon, data }: PieChartCardProps) => {
  const isMobile = useIsMobile();

  if (!data || data.length === 0) {
    return (
      <Card className="h-[450px] flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center">
            {icon}
            <CardTitle className="text-base ml-2">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Нет данных для отображения</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[450px] flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          {icon}
          <CardTitle className="text-base ml-2">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={isMobile ? 50 : 70}
                outerRadius={isMobile ? 70 : 90}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={true}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-auto">
          <div className="grid grid-cols-1 gap-2 text-xs">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="truncate max-w-[180px]" title={item.name}>
                    {item.name}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <span className="font-medium">{item.value.toLocaleString()} ₽</span>
                  {item.count !== undefined && (
                    <span className="text-muted-foreground">({item.count} шт.)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PieChartCard;
