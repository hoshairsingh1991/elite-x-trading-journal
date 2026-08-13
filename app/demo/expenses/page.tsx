"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/layout/Sidebar";

import { DEMO_EXPENSES } from "@/lib/demo/demoExpenses";
import { DEMO_TRADES } from "@/lib/demo/demoDataset";

import { generatePerformanceBreakdownAnalytics } from "@/lib/analytics/performanceBreakdownAnalytics";
import { calculateAnnualForecast } from "@/lib/analytics/annualForecastAnalytics";
import {
  generateBusinessCostAnalytics,
  generateBusinessIntelligenceMetrics,
} from "@/lib/analytics/businessCostAnalytics";

import { convertTradesToReportingCurrency } from "@/lib/fx/convertTradesToReportingCurrency";
import { convertExpensesToReportingCurrency } from "@/lib/fx/convertExpensesToReportingCurrency";
import { FALLBACK_RATES } from "@/lib/fx/fxRateProvider";

import ExpensesHeader from "@/components/expenses/ExpensesHeader";
import ExpenseKpiGrid from "@/components/expenses/ExpenseKpiGrid";
import ExpensesOverviewSection from "@/components/expenses/ExpensesOverviewSection";
import ManualExpensesTable from "@/components/expenses/ManualExpensesTable";
import ExpensesIntelligenceSection from "@/components/expenses/ExpensesIntelligenceSection";
import TaxDeductibleSummary from "@/components/expenses/TaxDeductibleSummary";
import AddExpenseDrawer from "@/components/expenses/AddExpenseDrawer";
import ExportExpenseDrawer from "@/components/expenses/ExportExpenseDrawer";

import type { Expense } from "@/lib/types/expense";

export default function DemoExpensesPage() {
  // Development Guard
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_DEMO_ROUTE !== "true") {
    // Allowed for local screenshot generation
  }

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isExportDrawerOpen, setIsExportDrawerOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewOnly, setViewOnly] = useState(false);

  const [reportingCurrency] = useState("USD");
  const [selectedPreset, setSelectedPreset] = useState("This Month");

  // Fixed May 1, 2026 - May 31, 2026 date range for marketing asset consistency
  const [startDate, setStartDate] = useState<Date | null>(
    () => new Date(2026, 4, 1, 0, 0, 0, 0)
  );
  const [endDate, setEndDate] = useState<Date | null>(
    () => new Date(2026, 4, 31, 23, 59, 59, 999)
  );

  // Convert demo expenses and trades to USD reporting currency
  const reportingExpenses = useMemo(() => {
    return convertExpensesToReportingCurrency(DEMO_EXPENSES, reportingCurrency, FALLBACK_RATES);
  }, [reportingCurrency]);

  const reportingTrades = useMemo(() => {
    return convertTradesToReportingCurrency(DEMO_TRADES, reportingCurrency, FALLBACK_RATES);
  }, [reportingCurrency]);

  const annualForecast = useMemo(() => {
    return calculateAnnualForecast(reportingExpenses);
  }, [reportingExpenses]);

  // Filter expenses and trades by May 2026 date range
  const filteredExpenses = useMemo(() => {
    return reportingExpenses.filter((expense) => {
      if (!startDate || !endDate) return true;
      const expenseDate = new Date(expense.expense_date + "T12:00:00");
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  }, [reportingExpenses, startDate, endDate]);

  const filteredTrades = useMemo(() => {
    return reportingTrades.filter((trade) => {
      if (!startDate || !endDate) return true;
      const tradeDate = new Date(trade.date);
      return tradeDate >= startDate && tradeDate <= endDate;
    });
  }, [reportingTrades, startDate, endDate]);

  // Calculate analytics via production engines
  const performanceBreakdownAnalytics = useMemo(() => {
    return generatePerformanceBreakdownAnalytics(filteredTrades);
  }, [filteredTrades]);

  const businessCostAnalytics = useMemo(() => {
    return generateBusinessCostAnalytics(
      filteredExpenses,
      filteredTrades,
      performanceBreakdownAnalytics.netTradingPnL
    );
  }, [filteredExpenses, filteredTrades, performanceBreakdownAnalytics.netTradingPnL]);

  const businessIntelligenceMetrics = useMemo(() => {
    return generateBusinessIntelligenceMetrics(
      filteredExpenses,
      filteredTrades,
      performanceBreakdownAnalytics.netTradingPnL
    );
  }, [filteredExpenses, filteredTrades, performanceBreakdownAnalytics.netTradingPnL]);

  return (
    <main className="flex h-screen overflow-x-hidden overflow-y-hidden bg-[#020817]">
      {/* Sidebar */}
      <div className="p-4">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <section className="flex min-w-0 flex-1 flex-col overflow-hidden pt-4 pr-10">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex justify-center">
            <div className="w-[98%]">
              <div className="h-3" />

              {/* Header */}
              <div className="relative z-[1000]">
                <ExpensesHeader
                  reportingCurrency={reportingCurrency}
                  selectedPreset={selectedPreset}
                  onDateRangeChange={(preset, start, end) => {
                    setSelectedPreset(preset);
                    setStartDate(start);
                    setEndDate(end);
                  }}
                  onExport={() => setIsExportDrawerOpen(true)}
                />
              </div>

              <div className="h-4" />

              {/* Top KPI Grid */}
              <div className="relative z-10 mt-10">
                <ExpenseKpiGrid
                  expenses={filteredExpenses}
                  businessCostAnalytics={businessCostAnalytics}
                  netTradingPnL={performanceBreakdownAnalytics.netTradingPnL}
                  reportingCurrency={reportingCurrency}
                />
              </div>

              {/* Business Intelligence Section */}
              <div className="relative z-10 mt-8">
                <ExpensesIntelligenceSection
                  expenses={reportingExpenses}
                  metrics={businessIntelligenceMetrics}
                  annualForecast={annualForecast}
                  reportingCurrency={reportingCurrency}
                />
              </div>

              <div className="h-2" />

              {/* Expenses Overview Section */}
              <div className="relative z-0 mt-8">
                <ExpensesOverviewSection
                  expenses={filteredExpenses}
                  trades={filteredTrades}
                  businessCostAnalytics={businessCostAnalytics}
                  reportingCurrency={reportingCurrency}
                />
              </div>

              <div className="h-4" />

              {/* Expense Ledger & Tax Summary */}
              <div className="pb-10">
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-9">
                    <ManualExpensesTable
                      expenses={DEMO_EXPENSES}
                      reportingCurrency={reportingCurrency}
                      fxRates={FALLBACK_RATES}
                      onAddExpense={() => {
                        setViewOnly(false);
                        setEditingExpense(null);
                        setIsAddExpenseOpen(true);
                      }}
                      onEditExpense={(expense) => {
                        setViewOnly(false);
                        setEditingExpense(expense);
                        setIsAddExpenseOpen(true);
                      }}
                      onViewExpense={(expense) => {
                        setViewOnly(true);
                        setEditingExpense(expense);
                        setIsAddExpenseOpen(true);
                      }}
                      onExpensesChanged={() => {}}
                    />
                  </div>

                  <div className="col-span-3">
                    <TaxDeductibleSummary
                      expenses={filteredExpenses}
                      reportingCurrency={reportingCurrency}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Export Drawer */}
      <ExportExpenseDrawer
        open={isExportDrawerOpen}
        onClose={() => setIsExportDrawerOpen(false)}
        expenses={reportingExpenses}
        reportingCurrency={reportingCurrency}
        generatedBy="Master Trading Operating Account"
        reportVersion="1.0"
      />

      {/* Add Expense Drawer */}
      <AddExpenseDrawer
        open={isAddExpenseOpen}
        onClose={() => {
          setEditingExpense(null);
          setViewOnly(false);
          setIsAddExpenseOpen(false);
        }}
        onSaveSuccess={() => {
          setEditingExpense(null);
          setViewOnly(false);
          setIsAddExpenseOpen(false);
        }}
        onEdit={() => setViewOnly(false)}
        editingExpense={editingExpense}
        viewOnly={viewOnly}
      />
    </main>
  );
}
