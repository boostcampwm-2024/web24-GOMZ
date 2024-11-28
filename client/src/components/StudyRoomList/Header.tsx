import { Link } from 'react-router-dom';
import Header from '@components/common/Header';
import StopWatch from '@components/common/StopWatch';

const StudyRoomListHeader = ({ className }: { className?: string }) => {
  return (
    <Header
      className={className}
      title={
        <Link to="/">
          <div className="flex items-baseline">
            <h1 className="text-2xl font-semibold">GOMZ</h1>
          </div>
        </Link>
      }
      stopWatch={
        <div className="text-xl font-normal">
          <StopWatch
            elapsedSeconds={Number(localStorage.getItem('totalStudyTime'))}
            isAnimationOn={false}
          />
        </div>
      }
      userInfo={
        <div className="flex gap-4 text-base font-normal">
          <div>{localStorage.getItem('nickName')}</div>
        </div>
      }
    />
  );
};

export default StudyRoomListHeader;
