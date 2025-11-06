import React, { useRef, useEffect } from "react";
import type { WebSecurityCheckResult } from "../types";
import {
  CheckCircleIcon,
  AlertTriangle,
  XCircleIcon,
  ExternalLink,
  RotateCcw,
} from "./icons";


const resultConfig = {
  safe: {
    title: "Safe to Visit",
    Icon: CheckCircleIcon,
    iconClassName: "text-primary",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    buttonText: "Proceed to Site",
  },
  suspicious: {
    title: "Potentially Unsafe",
    Icon: AlertTriangle,
    iconClassName: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    buttonText: "Proceed with Caution",
  },
  unsafe: {
    title: "Unsafe to Visit",
    Icon: XCircleIcon,
    iconClassName: "text-destructive",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    buttonText: "Scan Another",
  },
};

export const ResultDisplay: React.FC<{
  result: WebSecurityCheckResult;
  url: string;
  onReset: () => void;
}> = ({ result, url, onReset }) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const currentConfig = resultConfig[result.safetyLevel];
  const { Icon, iconClassName } = currentConfig;


  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div
      className={`p-6 rounded-2xl border ${currentConfig.borderColor} ${currentConfig.bgColor} animate-fade-in-up focus:outline-none`}
      role="alert"
    >
      <div className="flex flex-col items-center text-center">
        <Icon size={48} className={iconClassName} />
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mt-4 text-2xl font-bold focus:outline-none text-foreground"
        >
          {currentConfig.title}
        </h2>
        <p className="mt-2 italic text-muted-foreground">"{result.summary}"</p>
      </div>
      {result.threats.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 font-semibold text-foreground/80">
            Potential Issues Found:
          </h3>
          <ul className="space-y-2 text-sm">
            {result.threats.map((threat, i) => (
              <li key={`threat-${i}`} className="flex items-start gap-2">
                <AlertTriangle
                  size={16}
                  className="text-yellow-500 mt-0.5 flex-shrink-0"
                />
                <span className="text-foreground/90">{threat}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-8 space-y-3">
        {result.safetyLevel !== "unsafe" && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full gap-2 py-3 font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {currentConfig.buttonText} <ExternalLink size={16} />
          </a>
        )}
        <button
            onClick={onReset}
            className="flex items-center justify-center w-full gap-2 py-3 font-semibold rounded-lg bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
        >
            <RotateCcw size={16} /> {result.safetyLevel === 'unsafe' ? 'Scan Another' : 'Scan Again'}
        </button>
      </div>
    </div>
  );
};

export default ResultDisplay;