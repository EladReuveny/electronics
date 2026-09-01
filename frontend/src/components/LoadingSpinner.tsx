type LoadingSpinnerProps = {};

const LoadingSpinner = ({}: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-5 mt-40">
      <div className="size-24 border-2 border-(--text-clr)/25 border-t-(--secondary-clr) rounded-full animate-[3s_infinite_spin]" />
      <span className="text-2xl font-medium italic">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
