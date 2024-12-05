import { ReactNode } from 'react';

interface Header {
  className?: string;
  title: ReactNode;
  stopWatch: ReactNode;
  userInfo: ReactNode;
}

interface StopWatch {
  elapsedSeconds: number;
  isAnimationOn: boolean;
}

export type { Header, StopWatch };
