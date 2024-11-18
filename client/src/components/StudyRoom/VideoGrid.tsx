const RATIO = 4 / 3;
const MAX_HEIGHT = 600;
const MAX_WIDTH = MAX_HEIGHT * RATIO;
const GAP = 8;

interface Grid {
  cols: number;
  rows: number;
}

interface VideoGridProps {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteStreamMap: React.MutableRefObject<Map<string | undefined, MediaStream>>;
  nickNameMap: React.MutableRefObject<Map<string | undefined, string>>;
  grid: Grid;
}

const VideoGrid = ({ localVideoRef, remoteStreamMap, grid, nickNameMap }: VideoGridProps) => {
  return (
    <section
      className="flex flex-wrap items-center justify-center"
      style={{
        height: `${(MAX_HEIGHT / grid.cols) * grid.rows + GAP * (grid.rows - 1)}px`,
        width: `${MAX_WIDTH + GAP * (grid.cols - 1)}px`,
        gap: `${GAP}px`,
      }}
    >
      <div
        className="relative rounded-2xl border border-black bg-black"
        style={{
          height: `${MAX_HEIGHT / grid.cols}px`,
          width: `${MAX_WIDTH / grid.cols}px`,
        }}
      >
        <video
          className="h-full w-full rounded-2xl"
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
        />
        <div
          className="bg-gomz-black absolute left-0 top-full flex w-full items-center justify-between rounded-b-2xl text-white opacity-85"
          style={{
            height: `${Math.max(5 / Math.sqrt(grid.cols), 2)}rem`,
            transform: `translateY(-${Math.max(5 / Math.sqrt(grid.cols), 2)}rem)`,
            padding: `0 ${Math.max(3 / Math.sqrt(grid.cols), 1)}rem`,
          }}
        >
          <div
            className="truncate font-normal"
            style={{
              fontSize: `${Math.max(1.75 / Math.sqrt(grid.cols), 0.625)}rem`,
              maxWidth: `${MAX_WIDTH / grid.cols / 2.5}px`,
            }}
          >
            {localStorage.getItem('nickName')}
          </div>
          <div
            className="truncate font-normal tabular-nums"
            style={{
              fontSize: `${Math.max(1.75 / Math.sqrt(grid.cols), 0.625)}rem`,
            }}
          >
            01 : 23 : 45
          </div>
        </div>
      </div>
      {[...remoteStreamMap.current].map(([id, stream]) => (
        <div
          key={String(id)}
          className="relative rounded-2xl border border-black bg-black"
          style={{
            height: `${MAX_HEIGHT / grid.cols}px`,
            width: `${MAX_WIDTH / grid.cols}px`,
          }}
        >
          <video
            className="rounded-2xl"
            width="100%"
            height="100%"
            ref={(element) => {
              if (element) {
                element.srcObject = stream;
              }
            }}
            autoPlay
            playsInline
            muted={false}
          />
          <div
            className="bg-gomz-black absolute left-0 top-full flex w-full items-center justify-between rounded-b-2xl text-white opacity-85"
            style={{
              height: `${Math.max(5 / Math.sqrt(grid.cols), 2)}rem`,
              transform: `translateY(-${Math.max(5 / Math.sqrt(grid.cols), 2)}rem)`,
              padding: `0 ${Math.max(3 / Math.sqrt(grid.cols), 1)}rem`,
            }}
          >
            <div
              className="truncate font-normal"
              style={{
                fontSize: `${Math.max(1.75 / Math.sqrt(grid.cols), 0.625)}rem`,
                maxWidth: `${MAX_WIDTH / grid.cols / 2.5}px`,
              }}
            >
              {nickNameMap.current.get(id)}
            </div>
            <div
              className="truncate font-normal tabular-nums"
              style={{
                fontSize: `${Math.max(1.75 / Math.sqrt(grid.cols), 0.625)}rem`,
              }}
            >
              01 : 23 : 45
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default VideoGrid;
