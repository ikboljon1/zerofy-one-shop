import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, DollarSign, CreditCard } from "lucide-react";

const Stats = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="grid grid-cols-2 gap-4">
        <Card className="stat-card">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium">Продажи</p>
              <h3 className="text-2xl font-bold">$45,231</h3>
            </div>
            <div className="flex items-center text-emerald-500">
              <ArrowUpRight className="h-4 w-4" />
              <span className="text-sm">+20.1%</span>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium">Перечислено</p>
              <h3 className="text-2xl font-bold">$12,234</h3>
            </div>
            <div className="flex items-center text-emerald-500">
              <ArrowUpRight className="h-4 w-4" />
              <span className="text-sm">+10.5%</span>
            </div>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card className="stat-card">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium">Расходы</p>
              <h3 className="text-2xl font-bold">$8,442</h3>
            </div>
            <div className="flex items-center text-red-500">
              <ArrowDownRight className="h-4 w-4" />
              <span className="text-sm">-5.2%</span>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium">Чистая прибыль</p>
              <h3 className="text-2xl font-bold">$24,555</h3>
            </div>
            <div className="flex items-center text-emerald-500">
              <ArrowUpRight className="h-4 w-4" />
              <span className="text-sm">+15.3%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Stats;