"use client"
import React, { useState, useEffect, useCallback, PropsWithChildren } from 'react'
import { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import '../css/carousel.css'; 
import UploadFile from './carouselSlides/uploadFile';
import TopicPick from './carouselSlides/topic_pick';
import VideoStructure from './carouselSlides/videoStructure';
import Modal from './screenmodals';

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
  
  const setModals = (modalVisible: boolean, children?: React.ReactNode) => {
    setModal({modalVisible: modalVisible, children: (<>{children}</>)})
  }

  const slides = [
  <UploadFile nextSlide={scrollNext} setTopics={setTopics}/>, 
  <TopicPick nextSlide={scrollNext} setModal={setModals} topics={topics} setScripts={setScripts}/>, 
  <VideoStructure callback={scrollNext} setModal={setModals} scripts={scripts}/>]

  return (
    <div className=''>
      <Modal {...modal}/>
      <div className="embla">
        <div className="embla__viewport" ref={emblaRef}>
          <div className="embla__container">
            {slides.map((component, index) => (
              <div className="embla__slide flex flex-row items-center justify-center" key={index}>
       
                <div className='flex items-center justify-center'>
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
