import { ReactNode } from 'react';

interface HeaderProps {
  className?: string;
  title: ReactNode;
  timer: ReactNode;
  userInfo: ReactNode;
}

const Header = ({ className, title, timer, userInfo }: HeaderProps) => {
  return (
    <header
      className={`border-gomz-black flex h-[4.5rem] w-[65rem] items-center justify-center border-b ${className}`}
    >
      <div className="flex w-[26rem] justify-start">{title}</div>
      <div className="flex w-[13rem] justify-center">{timer}</div>
      <div className="flex w-[26rem] justify-end">{userInfo}</div>
    </header>
  );
};

export default Header;
