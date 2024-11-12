import { SVGProps } from 'react';

const Icon = (props: SVGProps<SVGSVGElement>) => {
  const id = props.id;
  const ariaLabel = props['aria-label'] || `${id} 아이콘`;

  return id ? (
    <svg {...props} aria-label={ariaLabel}>
      <use href={`/images/icons.svg#${id}`} />
    </svg>
  ) : null;
};

export default Icon;
