"use client"
import React, { useState, useEffect, useCallback, PropsWithChildren, useRef } from 'react'
import { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import '../css/carousel.css'; 
import UploadFile from './carouselSlides/uploadFile';
import TopicPick from './carouselSlides/topic_pick';
import VideoStructure from './carouselSlides/videoStructure';
import Modal from './screenmodals';
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import VideoSettings from './carouselSlides/videoSettings';
import { scriptData } from '@/app/api/generate_script/route';

export type settingItems = {
  voice: string,
  targetAudience: string, // stakeholders, children, adults, teens, accountants, engineers, scientist, student
  videoLength: number[],
  avatar: string,
  formality: string, // Intimate, Casual, Formal, Frozen, and 
  subtitles: boolean,
}

const defaultSettings = {
  voice: "Alloy",
  targetAudience: "Everyone", // stakeholders, children, adults, teens, accountants, engineers, scientist, student
  videoLength: [1,2],
  avatar: "None",
  formality: "Casual", // Intimate, Casual, Formal, Frozen, and Consultative
  subtitles: false,
}

export type topicsProp = {topic: string, summary: string}[]
export type scriptsProp = {section: string, scripts: string[]}[]

const EmblaCarousel: React.FC = () => {

  const [topics, setTopics] = useState<topicsProp>([])
  const [scripts, setScripts] = useState<scriptsProp>([])

  const [settings, setSettings] = useState(defaultSettings)
  const sliderRef = useRef<Slider>(null);

  const scrollNext = () => {
    sliderRef.current?.slickNext();
  };

  const slides = [
    <UploadFile key="uploadFile" nextSlide={scrollNext} setTopics={setTopics} />, 
    <TopicPick key="topicPick" nextSlide={scrollNext} topics={topics} setScripts={setScripts} />,
    <VideoSettings currSettings={settings} setSettings={setSettings} nextSlide={scrollNext} />, 
    <VideoStructure key="videoStructure" callback={scrollNext} allScripts={scriptData} />
  ];

  const carouselSettings = {
    dots: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    swipe: false,
    arrows: false
  };

 return (
    <div className='w-screen h-screen'>
      <Slider {...carouselSettings} ref={sliderRef} >
        {slides.map((component, index) => (
          <div key={index} className='h-screen w-screen'>
            <div className='w-4/5 h-4/5 mx-auto mt-20'>
              {component}
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default EmblaCarousel
