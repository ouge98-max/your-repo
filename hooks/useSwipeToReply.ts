import React, { useState, useRef, TouchEventHandler } from 'react';
import { hapticFeedback } from '../utils/interaction';

interface UseSwipeToReplyOptions {
  onSwipe: () => void;
  isCurrentUser: boolean;
}

const SWIPE_THRESHOLD = 60; // pixels to swipe
const MAX_SWIPE_DISTANCE = 80; // max distance for visual feedback

export const useSwipeToReply = ({ onSwipe, isCurrentUser }: UseSwipeToReplyOptions) => {
  const [translateX, setTranslateX] = useState(0);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const isSwipingRef = useRef(false);
  const swipeTriggeredRef = useRef(false);

  const handleTouchStart: TouchEventHandler<HTMLDivElement> = (e) => {
    touchStartRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
    isSwipingRef.current = false;
    swipeTriggeredRef.current = false;
  };

  const handleTouchMove: TouchEventHandler<HTMLDivElement> = (e) => {
    const deltaX = e.targetTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.targetTouches[0].clientY - touchStartRef.current.y;
    
    // Only allow horizontal swipes
    if (Math.abs(deltaX) < Math.abs(deltaY) && !isSwipingRef.current) {
        return;
    }
    
    isSwipingRef.current = true;

    // Prevent vertical scrolling while swiping
    if (e.cancelable) {
      e.preventDefault();
    }

    // Clamp the visual swipe distance
    const distance = isCurrentUser ? Math.max(-MAX_SWIPE_DISTANCE, Math.min(0, deltaX)) : Math.max(0, Math.min(MAX_SWIPE_DISTANCE, deltaX));
    setTranslateX(distance);

    if (!swipeTriggeredRef.current && Math.abs(distance) > SWIPE_THRESHOLD) {
        swipeTriggeredRef.current = true;
        hapticFeedback();
    }
  };

  const handleTouchEnd: TouchEventHandler<HTMLDivElement> = () => {
    if (swipeTriggeredRef.current) {
        onSwipe();
    }

    // Reset with animation
    setTranslateX(0);
    isSwipingRef.current = false;
  };

  const transform = `translateX(${translateX}px)`;
  const iconOpacity = Math.min(Math.abs(translateX) / SWIPE_THRESHOLD, 1);

  return {
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    transform,
    iconOpacity,
  };
};