type PageTitleProps = {
  title: string;
};

const PageTitle = ({ title }: PageTitleProps) => {
  return (
    <div className="flex items-center justify-center gap-4 mb-4">
      <div className="flex-1 h-1.5 bg-(--primary-clr) rounded" />
      <h1 className="text-4xl font-bold tracking-tight whitespace-nowrap">
        {title}
      </h1>
      <div className="flex-1 h-1.5 bg-(--primary-clr) rounded" />
    </div>
  );
};

export default PageTitle;
