
import React from 'react';
import Advertising from '@/components/Advertising';
import AdvertisingTips from './AdvertisingTips';

interface AdvertisingSectionProps {
  selectedStore?: { id: string; apiKey: string } | null;
}

const AdvertisingSection = ({ selectedStore }: AdvertisingSectionProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Реклама и советы</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Advertising selectedStore={selectedStore} />
        </div>
        <div className="lg:col-span-1">
          <AdvertisingTips />
        </div>
      </div>
    </div>
  );
};

export default AdvertisingSection;
