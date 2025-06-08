
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Planet } from "@/data/planets";
import { Play, Pause, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

interface ControlPanelProps {
  planets: Planet[];
  planetSpeeds: number[];
  onSpeedChange: (planetIndex: number, newSpeed: number) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onReset: () => void;
  selectedPlanet: string | null;
}

export const ControlPanel = ({
  planets,
  planetSpeeds,
  onSpeedChange,
  isPaused,
  onTogglePause,
  onReset,
  selectedPlanet
}: ControlPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="absolute bottom-6 right-6 z-10">
      <Card className="w-80 bg-black/80 border-gray-600 text-white backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Mission Control</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onTogglePause}
                className="bg-transparent border-gray-600 text-white hover:bg-gray-700"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="bg-transparent border-gray-600 text-white hover:bg-gray-700"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="bg-transparent border-gray-600 text-white hover:bg-gray-700"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          {selectedPlanet && (
            <Badge variant="secondary" className="w-fit bg-blue-600 text-white">
              Selected: {selectedPlanet}
            </Badge>
          )}
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="space-y-4 max-h-80 overflow-y-auto">
            <div className="text-sm text-gray-300 mb-4">
              Adjust orbital speeds • Click planets to select • Drag to rotate view
            </div>
            
            {planets.map((planet, index) => (
              <div 
                key={planet.name}
                className={`p-3 rounded-lg border transition-all ${
                  selectedPlanet === planet.name 
                    ? 'border-blue-400 bg-blue-900/20' 
                    : 'border-gray-600 bg-gray-800/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: planet.color }}
                    />
                    <span className="font-medium text-sm">{planet.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {planetSpeeds[index].toFixed(1)}x
                  </span>
                </div>
                
                <Slider
                  value={[planetSpeeds[index]]}
                  onValueChange={(value) => onSpeedChange(index, value[0])}
                  max={10}
                  min={0.1}
                  step={0.1}
                  className="w-full"
                />
                
                <div className="text-xs text-gray-400 mt-1">
                  {planet.description}
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>
    </div>
  );
};
