import { Pinwheel } from "ldrs/react";
import "ldrs/react/Pinwheel.css";

const Loader = () => {
  return (
    <main className="absolute top-0 left-0 h-dvh w-screen flex-center bg-background/50 overflow-hidden z-50">
      <Pinwheel size="35" stroke="3.5" speed="0.9" color="white" />
    </main>
  );
};

export default Loader;
