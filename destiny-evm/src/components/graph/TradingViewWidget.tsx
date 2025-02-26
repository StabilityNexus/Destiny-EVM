'use client';

import { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [{ proName: `BITSTAMP:${symbol}`, title: symbol }],
      colorTheme: 'dark',
      isTransparent: false,
      displayMode: 'adaptive',
    });

    containerRef.current.appendChild(script);
  }, [symbol]);

  return <div ref={containerRef} className="tradingview-widget-container" />;
};