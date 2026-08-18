'use client';

import React, { useEffect, useState, useRef } from 'react';

export default function AnimatedCounter({
  value,
  duration = 900,
  className = '',
  prefix = '',
  suffix = ''
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevTargetRef = useRef(null);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    // Extract numeric part, decimal places, and suffix if present in string
    let targetNum = 0;
    let decimals = 0;
    let rawSuffix = suffix;
    let rawPrefix = prefix;

    if (typeof value === 'number') {
      targetNum = value;
      decimals = Number.isInteger(value) ? 0 : (value.toString().split('.')[1] || '').length;
    } else if (typeof value === 'string') {
      const match = value.match(/([^\d.-]*)([\d,.]+)(.*)/);
      if (match) {
        if (!prefix && match[1]) rawPrefix = match[1];
        const numStr = match[2].replace(/,/g, '');
        targetNum = parseFloat(numStr);
        if (numStr.includes('.')) {
          decimals = numStr.split('.')[1].length;
        }
        if (!suffix && match[3]) rawSuffix = match[3];
      } else {
        setDisplayValue(value);
        return;
      }
    }

    if (isNaN(targetNum)) {
      setDisplayValue(value);
      return;
    }

    // Avoid re-animating if target value hasn't changed
    if (prevTargetRef.current === targetNum) {
      return;
    }
    prevTargetRef.current = targetNum;

    let startTime = null;
    let animationFrameId = null;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeOutCubic(progress);

      const currentNum = targetNum * easeProgress;

      let formattedNum = '';
      if (decimals > 0) {
        formattedNum = currentNum.toFixed(decimals);
      } else {
        formattedNum = Math.round(currentNum).toLocaleString();
      }

      setDisplayValue(`${rawPrefix}${formattedNum}${rawSuffix}`);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        // Final precise value
        let finalFormatted = decimals > 0 ? targetNum.toFixed(decimals) : targetNum.toLocaleString();
        setDisplayValue(`${rawPrefix}${finalFormatted}${rawSuffix}`);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration, prefix, suffix]);

  return <span className={className}>{displayValue}</span>;
}
