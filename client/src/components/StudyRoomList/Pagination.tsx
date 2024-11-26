import { useState } from 'react';

import Icon from '@components/common/Icon';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

const Pagination = ({ currentPage, totalPages, setCurrentPage }: PaginationProps) => {
  const [hoverLeft, setHoverLeft] = useState(false);
  const [hoverRight, setHoverRight] = useState(false);

  return (
    <div className="text-gomz-gray-400 flex justify-center gap-4 font-medium">
      <button
        className="rounded-full"
        disabled={currentPage <= 1}
        onClick={() => setCurrentPage((prev) => prev - 1)}
        onMouseEnter={() => currentPage > 1 && setHoverLeft(true)}
        onMouseLeave={() => currentPage > 1 && setHoverLeft(false)}
        style={{
          color: currentPage <= 1 ? 'white' : hoverLeft ? 'white' : '#9F9F9F',
          backgroundColor: currentPage <= 1 ? 'transparent' : hoverLeft ? '#1E1E1E' : 'transparent',
        }}
      >
        <Icon id="chevron" className="h-6 w-6 fill-current" />
      </button>
      {Array.from({ length: 5 }, (_, index) => {
        const page = index + 1 + 5 * Math.floor((currentPage - 1) / 5);

        return page <= totalPages ? (
          <button
            key={page}
            className="hover:bg-gomz-black h-6 w-6 rounded-full hover:font-semibold hover:text-white"
            onClick={() => setCurrentPage(page)}
            style={
              currentPage === page
                ? { color: 'white', backgroundColor: '#1E1E1E', fontWeight: '600' }
                : {}
            }
          >
            {page}
          </button>
        ) : null;
      })}
      <button
        className="rounded-full"
        disabled={currentPage >= totalPages}
        onClick={() => setCurrentPage((prev) => prev + 1)}
        onMouseEnter={() => currentPage < totalPages && setHoverRight(true)}
        onMouseLeave={() => currentPage < totalPages && setHoverRight(false)}
        style={{
          color: currentPage >= totalPages ? 'white' : hoverRight ? 'white' : '#9F9F9F',
          backgroundColor:
            currentPage >= totalPages ? 'transparent' : hoverRight ? '#1E1E1E' : 'transparent',
        }}
      >
        <Icon id="chevron" className="h-6 w-6 rotate-180 fill-current" />
      </button>
    </div>
  );
};

export default Pagination;
