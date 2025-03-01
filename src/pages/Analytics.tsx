
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnalyticsOverview from "@/components/analytics/AnalyticsOverview";
import AnalyticsDetails from "@/components/analytics/AnalyticsDetails";
import AnalyticsPerformance from "@/components/analytics/AnalyticsPerformance";

const Analytics = () => {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Аналитика магазина</h1>
          <p className="text-muted-foreground">
            Подробная аналитика и статистика по вашему магазину
          </p>
        </div>

        <main className="mt-8">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full md:w-auto grid-cols-3 h-auto">
              <TabsTrigger value="overview">Обзор</TabsTrigger>
              <TabsTrigger value="details">Детали</TabsTrigger>
              <TabsTrigger value="performance">Эффективность</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <AnalyticsOverview />
            </TabsContent>
            <TabsContent value="details">
              <AnalyticsDetails />
            </TabsContent>
            <TabsContent value="performance">
              <AnalyticsPerformance />
            </TabsContent>
          </Tabs>
        </main>
      </motion.div>
    </div>
  );
};

export default Analytics;
