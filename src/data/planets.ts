
export interface Planet {
  name: string;
  color: string;
  size: number;
  distance: number;
  speed: number;
  description: string;
}

export const planetsData: Planet[] = [
  {
    name: "Mercury",
    color: "#8C7853",
    size: 0.4,
    distance: 8,
    speed: 4.7,
    description: "Closest to the Sun"
  },
  {
    name: "Venus",
    color: "#FFC649",
    size: 0.9,
    distance: 11,
    speed: 3.5,
    description: "Hottest planet"
  },
  {
    name: "Earth",
    color: "#6B93D6",
    size: 1,
    distance: 15,
    speed: 3.0,
    description: "Our home planet"
  },
  {
    name: "Mars",
    color: "#CD5C5C",
    size: 0.5,
    distance: 20,
    speed: 2.4,
    description: "The red planet"
  },
  {
    name: "Jupiter",
    color: "#D8CA9D",
    size: 2.5,
    distance: 28,
    speed: 1.3,
    description: "Largest planet"
  },
  {
    name: "Saturn",
    color: "#FAD5A5",
    size: 2.1,
    distance: 38,
    speed: 0.9,
    description: "Planet with rings"
  },
  {
    name: "Uranus",
    color: "#4FD0E7",
    size: 1.6,
    distance: 48,
    speed: 0.7,
    description: "Tilted ice giant"
  },
  {
    name: "Neptune",
    color: "#4B70DD",
    size: 1.5,
    distance: 58,
    speed: 0.5,
    description: "Windiest planet"
  }
];
