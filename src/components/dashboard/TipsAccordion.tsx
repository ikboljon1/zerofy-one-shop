
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ProfitabilityTips from '@/components/analytics/components/ProfitabilityTips';
import AdvertisingOptimization from '@/components/analytics/components/AdvertisingOptimization';
import { HelpCircle } from 'lucide-react';

const TipsAccordion = () => {
  return (
    <div className="mb-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-1">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="tips" className="border-none">
          <AccordionTrigger className="px-4 py-3 flex items-center gap-2 text-base font-medium hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-900 rounded-md transition-colors">
            <HelpCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-400 dark:to-blue-400">
              Советы по оптимизации бизнеса
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-2 space-y-6">
            <ProfitabilityTips />
            <AdvertisingOptimization />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default TipsAccordion;
