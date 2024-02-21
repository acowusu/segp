import { useEffect, useState } from "react";
import { SetVisuals } from "../pages/set-visuals";
import { SetTopic } from "../pages/set-topic";
import { ScriptEditor } from "../pages/script-editor";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel"
import React from "react";

// const carouselItems = [
//   {
//     title: "Settings",
//     href: "/welcome/set-visuals",
//   },
//   {
//     title: "Topic generation",
//     href: "/welcome/set-topic",
//   },
//   {
//     title: "Script",
//     href: "/welcome/script-editor",
//   },
// ];

export function WelcomeLayout() {
  const [projectName, setProjectName] = useState("");

  const [api, setApi] = React.useState<CarouselApi>()
  


  useEffect(() => {
    const fetchProjectName = async () => {
      try {
        const projectName = await window.api.getProjectName();
        setProjectName(projectName);
      } catch (error) {
        console.error("Failed to fetch project name:", error);
      }
    };

    fetchProjectName();
  }, []);

  const carouselItems = [
    <SetVisuals nextSlide={api?.scrollNext!}/>, 
    <SetTopic />,
    <ScriptEditor />
  ];

 return (
  <div>

  <Carousel setApi={setApi}>
  <CarouselContent>
    {carouselItems.map((component, index) => (
      <div key={index} className='h-screen w-screen p-16 overflow-auto no-scrollbar'>
        <CarouselItem key={index}>
          {component}
        </CarouselItem>
      </div>
    ))}
  </CarouselContent>
  <CarouselPrevious/>
  <CarouselNext />
</Carousel>
    hit there
    <button onClick={() => console.log(api?.canScrollNext())}>
    akjsdhkjashdkjahsd</button>    
  </div>
  );
}
