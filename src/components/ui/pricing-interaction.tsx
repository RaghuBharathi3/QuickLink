"use client"

import NumberFlow from '@number-flow/react'
import React from "react";

export function PricingInteraction({
  starterMonth,
  starterAnnual,
  proMonth,
  proAnnual,
  onSubscribe
}: {
  starterMonth: number;
  starterAnnual: number;
  proMonth: number;
  proAnnual: number;
  onSubscribe: (planIndex: number, period: 'monthly' | 'yearly') => void;
}) {
  const [active, setActive] = React.useState(1); // Default to Pro
  const [period, setPeriod] = React.useState(0);
  
  const handleChangePlan = (index: number) => {
    setActive(index);
  };
  
  const handleChangePeriod = (index: number) => {
    setPeriod(index);
    if (index === 0) {
      setStarter(starterMonth);
      setPro(proMonth);
    } else {
      setStarter(starterAnnual);
      setPro(proAnnual);
    }
  };
  
  const [starter, setStarter] = React.useState(starterMonth);
  const [pro, setPro] = React.useState(proMonth);

  const handleAction = () => {
     onSubscribe(active, period === 0 ? 'monthly' : 'yearly');
  }

  return (
    <div className="border border-border/40 rounded-[32px] p-3 shadow-2xl shadow-primary/5 max-w-sm w-full flex flex-col items-center gap-3 bg-card dark:bg-neutral-900/40 backdrop-blur-xl relative">
        <div className="rounded-full relative w-full bg-slate-100 dark:bg-neutral-800 p-1.5 flex items-center">
          <button
            className="font-semibold rounded-full w-full p-1.5 text-slate-800 dark:text-neutral-200 z-20 transition-colors"
            onClick={() => handleChangePeriod(0)}
          >
            Monthly
          </button>
          <button
            className="font-semibold rounded-full w-full p-1.5 text-slate-800 dark:text-neutral-200 z-20 transition-colors"
            onClick={() => handleChangePeriod(1)}
          >
            Yearly
          </button>
          <div
            className="p-1.5 flex items-center justify-center absolute inset-0 w-1/2 z-10"
            style={{
              transform: `translateX(${period * 100}%)`,
              transition: "transform 0.3s cubic-bezier(0.2, 0, 0, 1)",
            }}
          >
            <div className="bg-white dark:bg-neutral-700 shadow-sm rounded-full w-full h-full"></div>
          </div>
        </div>
        <div className="w-full relative flex flex-col items-center justify-center gap-3">
          <div
            className="w-full flex justify-between cursor-pointer border-2 border-transparent hover:border-border/50 p-4 rounded-2xl transition-all"
            onClick={() => handleChangePlan(0)}
          >
            <div className="flex flex-col items-start">
              <p className="font-semibold text-xl text-foreground">Free</p>
              <p className="text-muted-foreground text-md">
                <span className="text-foreground font-medium">₹0.00</span>/month
              </p>
            </div>
            <div
              className="border-2 size-6 rounded-full mt-0.5 p-1 flex items-center justify-center transition-colors"
              style={{
                borderColor: `${active === 0 ? "hsl(var(--primary))" : "#64748b"}`,
              }}
            >
              <div
                className="size-3 rounded-full bg-primary transition-opacity"
                style={{ opacity: `${active === 0 ? 1 : 0}` }}
              ></div>
            </div>
          </div>
          
          <div
            className="w-full flex justify-between cursor-pointer border-2 border-transparent hover:border-border/50 p-4 rounded-2xl transition-all"
            onClick={() => handleChangePlan(1)}
          >
            <div className="flex flex-col items-start">
              <p className="font-semibold text-xl flex items-center gap-2 text-foreground">
                Pro{" "}
                <span className="py-1 px-2 block rounded-lg bg-primary/10 text-primary text-xs tracking-wider">
                  POPULAR
                </span>
              </p>
              <p className="text-muted-foreground text-md flex">
                <span className="text-foreground font-medium flex items-center">
                  ₹{" "}
                  <NumberFlow
                    className="text-foreground font-medium"
                    value={starter}
                  />
                </span>
                /month
              </p>
            </div>
            <div
              className="border-2 size-6 rounded-full mt-0.5 p-1 flex items-center justify-center transition-colors"
              style={{
                borderColor: `${active === 1 ? "hsl(var(--primary))" : "#64748b"}`,
              }}
            >
              <div
                className="size-3 rounded-full bg-primary transition-opacity"
                style={{ opacity: `${active === 1 ? 1 : 0}` }}
              ></div>
            </div>
          </div>
          
          <div
            className={`w-full h-[88px] absolute top-0 border-[2px] border-primary rounded-2xl pointer-events-none drop-shadow-[0_0_15px_rgba(var(--primary),0.2)]`}
            style={{
              transform: `translateY(${active * 88 + 12 * active}px)`,
              transition: "transform 0.4s cubic-bezier(0.2, 0, 0, 1)",
            }}
          ></div>
        </div>
        
        <button 
          onClick={handleAction}
          className="rounded-full bg-primary text-primary-foreground text-lg w-full p-3 font-medium active:scale-95 transition-transform duration-300 shadow-md flex items-center justify-center gap-2"
        >
          {active === 0 ? "Continue with Free" : "Upgrade Now"}
        </button>
      </div>
  );
};
