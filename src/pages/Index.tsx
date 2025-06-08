
import { SolarSystem } from "@/components/SolarSystem";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      <div className="relative w-full h-screen">
        <div className="absolute top-6 left-6 z-10">
          <h1 className="text-4xl font-bold text-white mb-2">
            Interactive Solar System
          </h1>
          <p className="text-lg text-gray-300">
            Explore the planets and control their orbital speeds
          </p>
        </div>
        <SolarSystem />
      </div>
    </div>
  );
};

export default Index;
