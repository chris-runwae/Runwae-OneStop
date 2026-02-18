const OnboardingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {" "}
      <div className="flex min-h-screen bg-background">
        {/* Left panel */}
        <div className="hidden w-2/5 lg:block bg-primary" />
        <div className="flex w-full flex-col justify-center mt-8 pr-6 py-12 lg:px-16 lg:pl-[100px] lg:w-1/2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;
