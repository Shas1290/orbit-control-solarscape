import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { planetsData, Planet } from "@/data/planets";
import { ControlPanel } from "./ControlPanel";
import { toast } from "sonner";

export const SolarSystem = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const planetsRef = useRef<THREE.Mesh[]>([]);
  const animationIdRef = useRef<number>();
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  
  const [planetSpeeds, setPlanetSpeeds] = useState<number[]>(
    planetsData.map(planet => planet.speed)
  );
  const [isPaused, setIsPaused] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 50, 80);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffffff, 2, 200);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // Create stars background
    createStars(scene);

    // Create sun - Fixed material to use MeshStandardMaterial for emissive properties
    const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
    const sunMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffd700,
      emissive: 0xffd700,
      emissiveIntensity: 0.3
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Create planets
    const planets: THREE.Mesh[] = [];
    planetsData.forEach((planetData, index) => {
      const planet = createPlanet(planetData);
      planet.userData = { 
        ...planetData, 
        index,
        angle: Math.random() * Math.PI * 2,
        originalSpeed: planetData.speed
      };
      planets.push(planet);
      scene.add(planet);

      // Create orbit lines
      const orbitGeometry = new THREE.RingGeometry(
        planetData.distance - 0.1,
        planetData.distance + 0.1,
        64
      );
      const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0x444444,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.2
      });
      const orbitRing = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbitRing.rotation.x = -Math.PI / 2;
      scene.add(orbitRing);
    });

    planetsRef.current = planets;

    // Mouse controls for camera
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseDown = (event: MouseEvent) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isMouseDown) return;

      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;

      const spherical = new THREE.Spherical();
      spherical.setFromVector3(camera.position);
      
      spherical.theta -= deltaX * 0.01;
      spherical.phi += deltaY * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 0, 0);

      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const handleWheel = (event: WheelEvent) => {
      const distance = camera.position.length();
      const newDistance = Math.max(20, Math.min(200, distance + event.deltaY * 0.1));
      camera.position.normalize().multiplyScalar(newDistance);
    };

    // Planet click detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(planets);

      if (intersects.length > 0) {
        const clickedPlanet = intersects[0].object as THREE.Mesh;
        const planetName = clickedPlanet.userData.name;
        setSelectedPlanet(planetName);
        toast(`Selected ${planetName}`, {
          description: clickedPlanet.userData.description
        });
      } else {
        setSelectedPlanet(null);
      }
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel);
    renderer.domElement.addEventListener('click', handleClick);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (!isPaused) {
        const delta = clockRef.current.getDelta();

        planets.forEach((planet, index) => {
          const userData = planet.userData;
          userData.angle += (planetSpeeds[index] * delta * 0.1);

          planet.position.x = Math.cos(userData.angle) * userData.distance;
          planet.position.z = Math.sin(userData.angle) * userData.distance;

          // Planet rotation
          planet.rotation.y += delta * 2;

          // Highlight selected planet
          if (selectedPlanet === userData.name) {
            const scale = 1 + Math.sin(Date.now() * 0.005) * 0.1;
            planet.scale.setScalar(scale);
          } else {
            planet.scale.setScalar(1);
          }
        });

        // Sun rotation
        sun.rotation.y += delta * 0.5;
      }

      renderer.render(scene, camera);
    };

    animate();
    toast("Solar System initialized! Click and drag to explore, scroll to zoom.");

    // Handle window resize
    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      renderer.domElement.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);

      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update planet speeds when state changes
  useEffect(() => {
    planetsRef.current.forEach((planet, index) => {
      planet.userData.speed = planetSpeeds[index];
    });
  }, [planetSpeeds]);

  const createPlanet = (planetData: Planet) => {
    const geometry = new THREE.SphereGeometry(planetData.size, 32, 32);
    const material = new THREE.MeshLambertMaterial({ 
      color: planetData.color
    });
    const planet = new THREE.Mesh(geometry, material);
    planet.castShadow = true;
    planet.receiveShadow = true;
    return planet;
  };

  const createStars = (scene: THREE.Scene) => {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ 
      color: 0xffffff,
      size: 2,
      sizeAttenuation: false
    });

    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
  };

  const handleSpeedChange = (planetIndex: number, newSpeed: number) => {
    const newSpeeds = [...planetSpeeds];
    newSpeeds[planetIndex] = newSpeed;
    setPlanetSpeeds(newSpeeds);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    toast(isPaused ? "Animation resumed" : "Animation paused");
  };

  const resetSpeeds = () => {
    setPlanetSpeeds(planetsData.map(planet => planet.speed));
    toast("Planet speeds reset to default");
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full" />
      <ControlPanel
        planets={planetsData}
        planetSpeeds={planetSpeeds}
        onSpeedChange={handleSpeedChange}
        isPaused={isPaused}
        onTogglePause={togglePause}
        onReset={resetSpeeds}
        selectedPlanet={selectedPlanet}
      />
    </div>
  );
};
