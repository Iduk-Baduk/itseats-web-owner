export const UpArrayIcon = ({ className }) => {
  return (
    <svg
      className={className}
      width="12"
      height="8"
      viewBox="0 0 12 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M1.41 8L6 3.42L10.59 8L12 6.59L6 0.59L0 6.59L1.41 8Z" fill="#349367" />
    </svg>
  );
};

export const DownArrayIcon = ({ className }) => {
  return (
    <svg
      className={className}
      width="12"
      height="8"
      viewBox="0 0 12 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.59 0.589844L6 5.16984L1.41 0.589844L0 1.99984L6 7.99984L12 1.99984L10.59 0.589844Z"
        fill="#349367"
      />
    </svg>
  );
};

export const DeleteIcon = ({ className }) => {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.1666 2.4785L15.5216 0.833496L8.99992 7.35516L2.47825 0.833496L0.833252 2.4785L7.35492 9.00016L0.833252 15.5218L2.47825 17.1668L8.99992 10.6452L15.5216 17.1668L17.1666 15.5218L10.6449 9.00016L17.1666 2.4785Z"
        fill="#B6B6B6"
      />
    </svg>
  );
};

export const PencilIcon = ({ className }) => (
  <svg 
    className={className}
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
  </svg>
);

export const PlusIcon = ({ className }) => (
  <svg 
    className={className}
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
); 
