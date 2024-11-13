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
  grid: Grid;
}

const VideoGrid = ({ localVideoRef, remoteStreamMap, grid }: VideoGridProps) => {
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
        className={`border-gomz-black rounded-2xl border bg-black`}
        style={{
          height: `${MAX_HEIGHT / grid.cols}px`,
          width: `${MAX_WIDTH / grid.cols}px`,
        }}
      >
        <video
          className="rounded-2xl"
          width="100%"
          height="100%"
          ref={localVideoRef}
          autoPlay
          playsInline
        />
      </div>
      {[...remoteStreamMap.current].map(([id, stream]) => (
        <div
          key={String(id)}
          className={`border-gomz-black rounded-2xl border bg-black`}
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
          />
        </div>
      ))}
    </section>
  );
};

export default VideoGrid;
