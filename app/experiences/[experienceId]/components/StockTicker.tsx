"use client";

import { useState, useEffect } from "react";

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

// Mock stock data for top companies
const mockStocks: StockData[] = [
  { symbol: "AAPL", price: 189.25, change: 2.15, changePercent: 1.15 },
  { symbol: "GOOGL", price: 142.85, change: -1.25, changePercent: -0.87 },
  { symbol: "TSLA", price: 248.50, change: 8.75, changePercent: 3.65 },
  { symbol: "MSFT", price: 378.85, change: 4.20, changePercent: 1.12 },
  { symbol: "AMZN", price: 155.50, change: -0.85, changePercent: -0.54 },
  { symbol: "NVDA", price: 875.25, change: 25.50, changePercent: 3.00 },
  { symbol: "META", price: 485.75, change: 12.30, changePercent: 2.60 },
  { symbol: "NFLX", price: 485.75, change: -8.45, changePercent: -1.71 },
];

export function StockTicker() {
  const [stocks, setStocks] = useState<StockData[]>(mockStocks);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prevStocks => 
        prevStocks.map(stock => ({
          ...stock,
          price: stock.price + (Math.random() - 0.5) * 2,
          change: stock.change + (Math.random() - 0.5) * 0.5,
          changePercent: stock.change / stock.price * 100
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full overflow-hidden bg-robinhood-bg border-b border-robinhood-border">
      <div className="flex animate-ticker">
        {/* First set of stocks */}
        {stocks.map((stock, index) => (
          <StockItem key={`first-${index}`} stock={stock} />
        ))}
        {/* Second set for seamless loop */}
        {stocks.map((stock, index) => (
          <StockItem key={`second-${index}`} stock={stock} />
        ))}
      </div>
    </div>
  );
}

function StockItem({ stock }: { stock: StockData }) {
  const isPositive = stock.changePercent >= 0;
  
  return (
    <div className="flex items-center gap-4 px-6 py-3 min-w-[200px] border-r border-robinhood-border">
      <div className="flex flex-col">
        <span className="text-robinhood-text font-medium text-sm">
          {stock.symbol}
        </span>
        <span className="text-robinhood-muted text-xs">
          ${stock.price.toFixed(2)}
        </span>
      </div>
      <div className="flex flex-col items-end">
        <span 
          className={`font-semibold text-sm ${
            isPositive 
              ? 'text-robinhood-green' 
              : 'text-robinhood-red'
          }`}
        >
          {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
        </span>
        <span 
          className={`text-xs ${
            isPositive 
              ? 'text-robinhood-green' 
              : 'text-robinhood-red'
          }`}
        >
          {isPositive ? '+' : ''}${stock.change.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

