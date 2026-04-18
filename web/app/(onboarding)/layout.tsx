const OnboardingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {" "}
      <div className="flex min-h-screen bg-background">
        {/* Left panel */}
        <div className="hidden w-2/5 lg:block bg-primary">
          <img
            src="/onboarding-image.png"
            alt="Onboarding Left Panel"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex w-full flex-col px-8 lg:pr-6  pt-32 pb-12 lg:px-16 lg:pl-25 lg:w-1/2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;
