"use client"
import React, { useState, useEffect, useCallback, PropsWithChildren } from 'react'
import { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import '../css/carousel.css'; 
import UploadFile from './uploadFile';



const DotButton = ({isSelected} : {isSelected: boolean}) => {
  return (
    <div className={'w-6 h-6 flex items-center mr-2 ml-2'}>
      {isSelected ? (
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-800 to-blue-400 rounded-md" />
      ) :  <div className="absolute inset-0 bg-white rounded-md h-1/3" />}
    </div>
  )
}


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
  
  const slides = [<UploadFile callback={scrollNext}/>, <UploadFile callback={scrollNext}/>, <UploadFile callback={scrollNext}/>]
  
  return (
    <div className=''>
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
