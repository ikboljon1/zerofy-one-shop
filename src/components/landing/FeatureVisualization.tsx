
import React from "react";
import { AreaChart, BarChart, LineChart, PieChart } from "recharts";
import { ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Warehouse, TrendingDown, TrendingUp, DollarSign, CircleCheck, AlertTriangle } from "lucide-react";

// Данные для графика анализа платного хранения
const storageData = [
  { name: "Янв", стоимость: 24000, излишки: 12000, оптимальный: 8000 },
  { name: "Фев", стоимость: 26000, излишки: 14000, оптимальный: 8000 },
  { name: "Мар", стоимость: 32000, излишки: 20000, оптимальный: 8000 },
  { name: "Апр", стоимость: 28000, излишки: 16000, оптимальный: 8000 },
  { name: "Май", стоимость: 22000, излишки: 10000, оптимальный: 8000 },
  { name: "Июн", стоимость: 18000, излишки: 6000, оптимальный: 8000 },
];

// Данные для графика рентабельности
const profitabilityData = [
  { name: "Товар A", выручка: 45000, затраты: 30000, прибыль: 15000 },
  { name: "Товар B", выручка: 60000, затраты: 40000, прибыль: 20000 },
  { name: "Товар C", выручка: 30000, затраты: 25000, прибыль: 5000 },
  { name: "Товар D", выручка: 70000, затраты: 45000, прибыль: 25000 },
  { name: "Товар E", выручка: 50000, затраты: 35000, прибыль: 15000 },
];

// Данные для графика эффективности рекламы
const adEffectivenessData = [
  { name: "Кампания 1", ctr: 1.5, cpc: 30, conv: 2.8, roi: 180 },
  { name: "Кампания 2", ctr: 2.1, cpc: 28, conv: 3.2, roi: 210 },
  { name: "Кампания 3", ctr: 1.8, cpc: 32, conv: 2.5, roi: 160 },
  { name: "Кампания 4", ctr: 2.5, cpc: 25, conv: 3.8, roi: 250 },
  { name: "Кампания 5", ctr: 1.2, cpc: 35, conv: 2.0, roi: 140 },
];

// Данные для круговой диаграммы структуры затрат на хранение
const storageBreakdownData = [
  { name: "Обычное хранение", value: 40 },
  { name: "Платное хранение", value: 35 },
  { name: "Штрафы за просрочку", value: 15 },
  { name: "Штрафы за объем", value: 10 },
];

export type FeatureVisualizationType = 
  | "storage-analysis" 
  | "profitability" 
  | "ad-effectiveness";

interface FeatureVisualizationProps {
  type: FeatureVisualizationType;
  className?: string;
}

export const FeatureVisualization: React.FC<FeatureVisualizationProps> = ({ 
  type, 
  className 
}) => {
  const chartConfig = {
    стоимость: {
      label: "Общая стоимость хранения",
      color: "#8884d8",
    },
    излишки: {
      label: "Переплата за излишки",
      color: "#d88884",
    },
    оптимальный: {
      label: "Оптимальный уровень",
      color: "#82ca9d",
    },
    выручка: {
      label: "Выручка",
      color: "#8884d8",
    },
    затраты: {
      label: "Затраты",
      color: "#d88884",
    },
    прибыль: {
      label: "Прибыль",
      color: "#82ca9d",
    },
    ctr: {
      label: "CTR (%)",
      color: "#8884d8",
    },
    cpc: {
      label: "CPC (₽)",
      color: "#d88884",
    },
    conv: {
      label: "Конверсия (%)",
      color: "#82ca9d",
    },
    roi: {
      label: "ROI (%)",
      color: "#ffc658",
    },
  };

  const pieConfig = {
    "Обычное хранение": {
      label: "Обычное хранение",
      color: "#8884d8",
    },
    "Платное хранение": {
      label: "Платное хранение",
      color: "#d88884",
    },
    "Штрафы за просрочку": {
      label: "Штрафы за просрочку",
      color: "#82ca9d",
    },
    "Штрафы за объем": {
      label: "Штрафы за объем",
      color: "#ffc658",
    },
  };

  const renderStorageAnalysis = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Анализ затрат на хранение</h3>
          <p className="text-sm text-muted-foreground">Динамика расходов на хранение товаров</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <TrendingDown className="h-3 w-3 text-red-500" />
          <span>-22% затрат</span>
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <ChartContainer className="h-64" config={chartConfig}>
              <AreaChart data={storageData}>
                <defs>
                  <linearGradient id="colorСтоимость" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorИзлишки" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d88884" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#d88884" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
                <RechartsPrimitive.XAxis dataKey="name" />
                <RechartsPrimitive.YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <RechartsPrimitive.Area 
                  type="monotone" 
                  dataKey="стоимость" 
                  stroke="#8884d8" 
                  fillOpacity={1} 
                  fill="url(#colorСтоимость)" 
                />
                <RechartsPrimitive.Area 
                  type="monotone" 
                  dataKey="излишки" 
                  stroke="#d88884" 
                  fillOpacity={1} 
                  fill="url(#colorИзлишки)" 
                />
                <RechartsPrimitive.Line 
                  type="monotone" 
                  dataKey="оптимальный" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="mb-3">
              <h4 className="text-sm font-medium">Структура расходов на хранение</h4>
              <p className="text-xs text-muted-foreground">Распределение затрат по категориям</p>
            </div>
            <ChartContainer className="h-56" config={pieConfig}>
              <PieChart>
                <RechartsPrimitive.Pie
                  data={storageBreakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {storageBreakdownData.map((entry, index) => (
                    <RechartsPrimitive.Cell 
                      key={`cell-${index}`} 
                      fill={pieConfig[entry.name as keyof typeof pieConfig]?.color || "#000"} 
                    />
                  ))}
                </RechartsPrimitive.Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border shadow-sm flex flex-col">
          <div className="flex items-center mb-2">
            <Warehouse className="h-5 w-5 text-primary mr-2" />
            <h4 className="text-sm font-medium">Переплата за хранение</h4>
          </div>
          <div className="text-2xl font-bold mt-2">134 800 ₽</div>
          <p className="text-xs text-muted-foreground mt-1">за последние 6 месяцев</p>
          <Badge variant="destructive" className="mt-auto w-fit">Критично</Badge>
        </Card>
        
        <Card className="p-4 border shadow-sm flex flex-col">
          <div className="flex items-center mb-2">
            <TrendingDown className="h-5 w-5 text-green-500 mr-2" />
            <h4 className="text-sm font-medium">Потенциальная экономия</h4>
          </div>
          <div className="text-2xl font-bold mt-2">98 600 ₽</div>
          <p className="text-xs text-muted-foreground mt-1">при оптимизации запасов</p>
          <Badge variant="outline" className="mt-auto w-fit bg-green-50">Рекомендуется</Badge>
        </Card>
        
        <Card className="p-4 border shadow-sm flex flex-col">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            <h4 className="text-sm font-medium">Товары с высокими затратами</h4>
          </div>
          <div className="text-2xl font-bold mt-2">8 SKU</div>
          <p className="text-xs text-muted-foreground mt-1">требуют немедленной оптимизации</p>
          <Badge variant="secondary" className="mt-auto w-fit">Требует внимания</Badge>
        </Card>
      </div>
    </div>
  );
  
  const renderProfitabilityCalculation = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Расчет рентабельности товаров</h3>
          <p className="text-sm text-muted-foreground">Детальный анализ прибыльности каждого SKU</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-green-500" />
          <span>+18% прибыль</span>
        </Badge>
      </div>
      
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <ChartContainer className="h-64" config={chartConfig}>
            <BarChart data={profitabilityData}>
              <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
              <RechartsPrimitive.XAxis dataKey="name" />
              <RechartsPrimitive.YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <RechartsPrimitive.Bar dataKey="выручка" fill="#8884d8" />
              <RechartsPrimitive.Bar dataKey="затраты" fill="#d88884" />
              <RechartsPrimitive.Bar dataKey="прибыль" fill="#82ca9d" />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border shadow-sm flex flex-col">
          <div className="flex items-center mb-2">
            <DollarSign className="h-5 w-5 text-green-500 mr-2" />
            <h4 className="text-sm font-medium">Средняя маржинальность</h4>
          </div>
          <div className="text-2xl font-bold mt-2">34.2%</div>
          <p className="text-xs text-muted-foreground mt-1">после всех расходов</p>
          <Badge variant="outline" className="mt-auto w-fit bg-green-50">Выше рынка</Badge>
        </Card>
        
        <Card className="p-4 border shadow-sm flex flex-col">
          <div className="flex items-center mb-2">
            <CircleCheck className="h-5 w-5 text-primary mr-2" />
            <h4 className="text-sm font-medium">Высокорентабельные SKU</h4>
          </div>
          <div className="text-2xl font-bold mt-2">12 товаров</div>
          <p className="text-xs text-muted-foreground mt-1">маржинальность > 40%</p>
          <Badge variant="outline" className="mt-auto w-fit">Масштабировать</Badge>
        </Card>
        
        <Card className="p-4 border shadow-sm flex flex-col">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            <h4 className="text-sm font-medium">Низкорентабельные SKU</h4>
          </div>
          <div className="text-2xl font-bold mt-2">5 товаров</div>
          <p className="text-xs text-muted-foreground mt-1">маржинальность &lt; 10%</p>
          <Badge variant="secondary" className="mt-auto w-fit">Требуют оптимизации</Badge>
        </Card>
      </div>
    </div>
  );
  
  const renderAdEffectiveness = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Эффективность рекламных кампаний</h3>
          <p className="text-sm text-muted-foreground">Мониторинг ключевых показателей рекламных размещений</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-green-500" />
          <span>ROI +24%</span>
        </Badge>
      </div>
      
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <ChartContainer className="h-64" config={chartConfig}>
            <LineChart data={adEffectivenessData}>
              <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
              <RechartsPrimitive.XAxis dataKey="name" />
              <RechartsPrimitive.YAxis yAxisId="left" />
              <RechartsPrimitive.YAxis yAxisId="right" orientation="right" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <RechartsPrimitive.Line 
                yAxisId="left"
                type="monotone" 
                dataKey="ctr" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
              <RechartsPrimitive.Line 
                yAxisId="left"
                type="monotone" 
                dataKey="conv" 
                stroke="#82ca9d" 
              />
              <RechartsPrimitive.Line 
                yAxisId="right"
                type="monotone" 
                dataKey="cpc" 
                stroke="#d88884" 
              />
              <RechartsPrimitive.Line 
                yAxisId="right"
                type="monotone" 
                dataKey="roi" 
                stroke="#ffc658" 
              />
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border shadow-sm flex flex-col">
          <div className="flex items-center mb-2">
            <TrendingUp className="h-5 w-5 text-primary mr-2" />
            <h4 className="text-sm font-medium">Средний CTR</h4>
          </div>
          <div className="text-2xl font-bold mt-2">2.3%</div>
          <p className="text-xs text-muted-foreground mt-1">↑ 0.4% к прошлому периоду</p>
        </Card>
        
        <Card className="p-4 border shadow-sm flex flex-col">
          <div className="flex items-center mb-2">
            <DollarSign className="h-5 w-5 text-primary mr-2" />
            <h4 className="text-sm font-medium">Средний CPC</h4>
          </div>
          <div className="text-2xl font-bold mt-2">27.8 ₽</div>
          <p className="text-xs text-muted-foreground mt-1">↓ 3.2₽ к прошлому периоду</p>
        </Card>
        
        <Card className="p-4 border shadow-sm flex flex-col">
          <div className="flex items-center mb-2">
            <CircleCheck className="h-5 w-5 text-primary mr-2" />
            <h4 className="text-sm font-medium">Конверсия</h4>
          </div>
          <div className="text-2xl font-bold mt-2">3.1%</div>
          <p className="text-xs text-muted-foreground mt-1">↑ 0.6% к прошлому периоду</p>
        </Card>
        
        <Card className="p-4 border shadow-sm flex flex-col">
          <div className="flex items-center mb-2">
            <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
            <h4 className="text-sm font-medium">ROI</h4>
          </div>
          <div className="text-2xl font-bold mt-2">188%</div>
          <p className="text-xs text-muted-foreground mt-1">↑ 24% к прошлому периоду</p>
        </Card>
      </div>
    </div>
  );

  switch (type) {
    case "storage-analysis":
      return renderStorageAnalysis();
    case "profitability":
      return renderProfitabilityCalculation();
    case "ad-effectiveness":
      return renderAdEffectiveness();
    default:
      return null;
  }
};

// Need to import RechartsPrimitive to use its components
import * as RechartsPrimitive from "recharts";
import { ChartLegendContent } from "@/components/ui/chart";

export default FeatureVisualization;
