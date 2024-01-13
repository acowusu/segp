"use client"
import React, { useState, useEffect, useCallback, PropsWithChildren } from 'react'
import { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import '../css/carousel.css'; 
import UploadFile from './carouselSlides/uploadFile';
import TopicPick from './carouselSlides/topic_pick';
import VideoStructure from './carouselSlides/videoStructure';

export type topics = {topic: string, summary: string}[]

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
  
  
  const [modalVisible, setModalVisible] = useState(false);
  const [topics, setTopics] = useState<topics>([])
  
  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false)
  
  const slides = [<UploadFile nextSlide={scrollNext} setTopics={setTopics}/>, <TopicPick nextSlide={scrollNext} openModal={openModal} topics={topics}/>, <VideoStructure callback={scrollNext} openModal={openModal}/>]

  function AdvancedModal() {
      return (
          <div>
              {modalVisible &&
                  <div className="bg-black bg-opacity-60 w-screen h-screen z-[300] fixed top-0 flex flex-col items-center justify-center">
                      {/* Content */}
                      <div className="bg-gradient-to-r from-black to-gray-800 rounded-lg w-3/5 h-4/5 p-6 overflow-auto">
                          {/* Top Bar with Title and Close Button */}
                          <div className="w-full py-4 px-6 flex justify-between items-center">
                              <h2 className="text-4xl font-bold text-white">Advanced Options</h2>
                              <button onClick={closeModal} className="text-gray-600 hover:text-black focus:outline-none">
                                  <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-6 w-6"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                  >
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M6 18L18 6M6 6l12 12"
                                      />
                                  </svg>
                              </button>
                          </div>
                          <hr className="mt-4 mb-8"/>
                          <div className="overflow-y-auto no-scrollbar text-white flex flex-col gap-4">
                              <p>Choose voice</p>
                              <p>Choose taget audience</p>
                              <p>Choose video length</p>
                              <p>Choose overlaying avatar</p>
                              <p>Choose level of formality</p>
                              <p>Add Subtitles?</p>
                              <input className='text-black' placeholder='Add extra info'/>
                          </div>
                      </div>
                  </div>
              }
          </div>
      )
  }










  return (
    <div className=''>
      <AdvancedModal />
      <div className="embla">
        <div className="embla__viewport" ref={emblaRef}>
          <div className="embla__container">
            {slides.map((component, index) => (
              <div className="embla__slide" key={index}>
                <div>
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
