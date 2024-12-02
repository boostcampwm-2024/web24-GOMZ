import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_SIGNALING_SERVER_URL;

const Home = () => {
  const navigate = useNavigate();

  const handleGuestLogin = async () => {
    if (!localStorage.getItem('nickName')) {
      const res = await fetch(`${API_BASE_URL}/user/random-name`);
      const { nickName } = await res.json();
      localStorage.setItem('nickName', nickName);
    }
    navigate('/study-room-list');
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex h-[32rem] w-[68.5rem] items-center justify-between">
        <div className="flex h-[32rem] w-[32rem] flex-col justify-center gap-12">
          <div className="flex flex-col items-center">
            <h3 className="text-3xl font-semibold">실시간 학습 기록 플랫폼</h3>
            <h1 className="text-9xl font-bold">GOMZ</h1>
          </div>
          <div className="flex flex-col items-center">
            <button
              onClick={handleGuestLogin}
              className="bg-gomz-black h-[5rem] w-[20rem] rounded-full text-3xl font-semibold text-white transition-transform hover:scale-105"
            >
              시작하기
            </button>
          </div>
        </div>
        <img src="/images/gomz-logo.png" alt="gomz 로고" className="h-[32rem] w-[32rem]" />
      </div>
    </div>
  );
};

export default Home;
