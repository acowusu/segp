"use client"
import React, { useState, useEffect, useCallback, PropsWithChildren } from 'react'
import { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import '../css/carousel.css'; 
import UploadFile from './carouselSlides/uploadFile';
import TopicPick from './carouselSlides/topic_pick';
import VideoStructure from './carouselSlides/videoStructure';
import Modal from './screenmodals';
import VideoSettings from './carouselSlides/videoSettings';

export type settingItems = {
  voice: string,
  targetAudience: string, // stakeholders, children, adults, teens, accountants, engineers, scientist, student
  videoLength: number,
  avitar: number,
  formality: number, // Intimate, Casual, Formal, Frozen, and 
  subtitles: boolean,
}

const defaultSettings = {
  voice: "Alloy",
  targetAudience: "Everyone", // stakeholders, children, adults, teens, accountants, engineers, scientist, student
  videoLength: 2,
  avitar: -1,
  formality: 0, // Intimate, Casual, Formal, Frozen, and 
  subtitles: false,
}




export type topicsProp = {topic: string, summary: string}[]
export type scriptsProp = {section: string, script1: string, script2: string}[]

type PropType = {
  options?: EmblaOptionsType
}

const EmblaCarousel: React.FC<PropType> = (props) => {
  const { options } = props
  const [emblaRef, emblaApi] = useEmblaCarousel(options)
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  
  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
    )
    const scrollNext = useCallback(
      () => emblaApi && emblaApi.scrollNext(),
      [emblaApi]
      )
      const scrollTo = useCallback(
        (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
    )
    
    const onInit = useCallback((emblaApi: EmblaCarouselType) => {
      setScrollSnaps(emblaApi.scrollSnapList())
    }, [])

    
    const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
      setPrevBtnDisabled(!emblaApi.canScrollPrev())
      setNextBtnDisabled(!emblaApi.canScrollNext())
    }, [])
    
    useEffect(() => {
      if (!emblaApi) return

    onInit(emblaApi)
    onSelect(emblaApi)
    emblaApi.on('reInit', onInit)
    emblaApi.on('reInit', onSelect)
    emblaApi.on('select', onSelect)
  }, [emblaApi, onInit, onSelect])
  
  
  const [modal, setModal] = useState({modalVisible: false,  children: (<></>)});
  const [topics, setTopics] = useState<topicsProp>([])
  const [scripts, setScripts] = useState<scriptsProp>([])

  const [settings, setSettings] = useState(defaultSettings)
  
  const setModals = (modalVisible: boolean, children?: React.ReactNode) => {
    setModal({modalVisible: modalVisible, children: (<>{children}</>)})
  }

  const slides = [
    <UploadFile key="uploadFile" nextSlide={scrollNext} setTopics={setTopics} />, 
    <TopicPick key="topicPick" nextSlide={scrollNext} topics={topics} setScripts={setScripts} />,
    <VideoSettings currSettings={settings} setSettings={setSettings} nextSlide={scrollNext} />, 
    <VideoStructure key="videoStructure" callback={scrollNext} setModal={setModals} scripts={scripts} />
  ];

  return (
    <div className='w-screen h-screen'>
      <Modal {...modal}/>
      <div className="embla h-full">
        <div className="embla__viewport h-full" ref={emblaRef} >
          <div className="embla__container h-full">
            {slides.map((component, index) => (
              <div className="embla__slide flex flex-row w-full items-center justify-center h-full" key={index}>
                <div className='w-4/5 h-4/5'>
                  {component}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmblaCarousel
