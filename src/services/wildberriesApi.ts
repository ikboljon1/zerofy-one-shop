
import React from "react";
import { LucideProps } from "lucide-react";
import axios from "axios";

// Original SVG icons
export const ShoppingCart = React.forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  )
);

ShoppingCart.displayName = "ShoppingCart";

export const TrendingDown = React.forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  )
);

TrendingDown.displayName = "TrendingDown";

export const Percent = React.forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="19" x2="5" y1="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  )
);

Percent.displayName = "Percent";

// Types for Wildberries API responses
export interface WildberriesResponse {
  orders: number;
  sales: number;
  returns: number;
  netProfit: number;
  deductions: DeductionInfo;
}

export interface DeductionInfo {
  total_deduction: number;
  deductions: Deduction[];
}

export interface Deduction {
  nm_id: number;
  bonus_type_name: string;
  deduction: number;
}

export interface WildberriesReportDetailItem {
  date: string;
  lastChangeDate: string;
  warehouseName: string;
  warehouseType: string;
  countryName: string;
  oblastOkrugName: string;
  regionName: string;
  supplierArticle: string;
  nm_id: number;
  barcode: string;
  category: string;
  subject: string;
  brand: string;
  techSize: string;
  incomeID: number;
  isSupply: boolean;
  isRealization: boolean;
  totalPrice: number;
  discountPercent: number;
  spp: number;
  finishedPrice: number;
  priceWithDisc: number;
  isCancel: boolean;
  isReturn?: boolean;
  cancelDate: string;
  orderType: string;
  sticker: string;
  gNumber: string;
  srid: string;
  rrd_id?: number; // Used for pagination
  deduction?: number; // Deduction amount
  bonus_type_name?: string; // Type of bonus or deduction
}

/**
 * Formats a date string to YYYY-MM-DD format for Wildberries API
 */
export const formatDate = (dateStr: string): string => {
  try {
    const dateObject = new Date(dateStr);
    return dateObject.toISOString().split('T')[0];
  } catch (error) {
    console.error(`Error formatting date: ${dateStr}`, error);
    return '';
  }
};

/**
 * Fetches detailed report data from Wildberries API with pagination support
 */
export const fetchWildberriesReportDetail = async (
  apiKey: string,
  dateFrom: string,
  dateTo: string,
  rrdid: number = 0
): Promise<{data: WildberriesReportDetailItem[], nextRrdid: number}> => {
  const url = "https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod";
  const headers = {
    "Authorization": apiKey,
  };
  const params = {
    dateFrom: formatDate(dateFrom),
    dateTo: formatDate(dateTo),
    rrdid: rrdid,
    limit: 100000,
  };

  try {
    const response = await axios.get(url, { headers, params });
    const data = response.data as WildberriesReportDetailItem[];
    
    let nextRrdid = 0;
    if (data && data.length > 0) {
      const lastRecord = data[data.length - 1];
      nextRrdid = lastRecord.rrd_id || 0;
    }
    
    return { data, nextRrdid };
  } catch (error) {
    console.error("Error fetching Wildberries report detail:", error);
    return { data: [], nextRrdid: 0 };
  }
};

/**
 * Calculates deductions from report data
 */
export const calculateDeductions = (
  data: WildberriesReportDetailItem[]
): DeductionInfo => {
  const deductions: Deduction[] = [];
  let totalDeduction = 0;

  if (!data || data.length === 0) {
    return { total_deduction: 0, deductions: [] };
  }

  for (const record of data) {
    const deductionAmount = record.deduction || 0;
    if (deductionAmount) {
      totalDeduction += deductionAmount;
      deductions.push({
        nm_id: record.nm_id,
        bonus_type_name: record.bonus_type_name || "Unknown",
        deduction: deductionAmount,
      });
    }
  }

  return {
    total_deduction: Number(totalDeduction.toFixed(2)),
    deductions: deductions,
  };
};

/**
 * Fetches all deduction data with pagination support
 */
export const fetchAllDeductionsData = async (
  apiKey: string,
  dateFrom: string,
  dateTo: string
): Promise<DeductionInfo> => {
  let allData: WildberriesReportDetailItem[] = [];
  let nextRrdid = 0;

  try {
    // Fetch data with pagination
    while (true) {
      const { data, nextRrdid: newRrdid } = await fetchWildberriesReportDetail(
        apiKey,
        dateFrom,
        dateTo,
        nextRrdid
      );

      if (!data || data.length === 0) {
        break;
      }

      allData = [...allData, ...data];
      nextRrdid = newRrdid;

      if (!nextRrdid) {
        break;
      }
    }

    // Calculate deductions from all fetched data
    return calculateDeductions(allData);
  } catch (error) {
    console.error("Error fetching all deductions data:", error);
    return { total_deduction: 0, deductions: [] };
  }
};
