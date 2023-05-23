// import { FAProSolid, FontAwesomeIcon } from "@excalibur/config/fontawesome"
// import clsx from "clsx"
// import Image from "next/image"
// import Link from "next/link"
import { useEffect, useState } from "react"
// import LazyEpisodeThumbnail from "./LazyEpisodeThumbnail"
// import SectionTitle from "./SectionTitle"
import styles from "./Carrousel.module.css" // Import CSS Module

function Carrousel() {
  const [activeCarrousel, setActiveCarrousel] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [, setIsThumbnailMounted] = useState(false)

  useEffect(() => {
    setIsThumbnailMounted(true)
  }, [])

  const episodes = [
    {
      creator: "Excalibur",
      title: "AI Special Guest",
      description:
        "Today we have a special guest who works closely with AI, what will we find out?.",
      link: "https://excalibur.fm/player/H5BwguCnsafaQfdi3KFrSggxvHsb18DLH5pEmt7ScV7V",
      logo: "/assets/excalibur.png",
      episodeThumbnail:
        "https://arweave.net/YUi3QnPy72Zbu-k7LLYgMQG_rOxaHseY3O20Ki4Ok_0?w=1920",
    },
    {
      creator: "Excalibur",
      title: "Can AI Use Crypto?",
      description:
        "Today we talk about what would happen if an AI got a hold of a crypto wallet.",
      link: "https://excalibur.fm/player/BAZdPW5gRjy8vvDBrYTy4NGfdDWSgXUWqzG29mUuePzT",
      logo: "/assets/excalibur.png",
      episodeThumbnail:
        "https://arweave.net/YUi3QnPy72Zbu-k7LLYgMQG_rOxaHseY3O20Ki4Ok_0?w=1920",
    },
    {
      creator: "Nephology",
      title: "22: Italian Crypto Tax Regime",
      description:
        "Jamie is joined by Michele Ferrari, who has returned to the podcast to discuss the new tax regime for crypto in Italy. If you live in Italy or if you have ever considered moving there, this episode explores everyhitng you need to know about moving, trading and holdings your crypto.",
      link: "https://excalibur.fm/player/Ds2Mdvd7Vkyg6vK6YAZn1QCZc9GW8qnbNz8rzWNRd9y1",
      logo: "https://arweave.net/D2xg8FapEqX4Of_DRDmv8V1HN12lB6nQicJIpqsuyk8?w=2048",
      episodeThumbnail:
        "https://arweave.net/D2xg8FapEqX4Of_DRDmv8V1HN12lB6nQicJIpqsuyk8?w=2048",
    },
    {
      creator: "Excalibur",
      title: "Crypto & Government",
      description:
        "Today we talk about how crypto and government can co-exsist!",
      link: "https://excalibur.fm/player/FUHxQ8f6YnXqEfbrEEp4buV98a263bMKvSv2Ewr5Ud96",
      logo: "/assets/excalibur.png",
      episodeThumbnail:
        "https://arweave.net/YUi3QnPy72Zbu-k7LLYgMQG_rOxaHseY3O20Ki4Ok_0?w=1920",
    },
  ]

  const handleNextCarrousel = () => {
    setTransitioning(true)
    if (activeCarrousel < episodes.length - 1) {
      setActiveCarrousel(activeCarrousel + 1)
    } else {
      setActiveCarrousel(0)
    }
  }

  const handlePreviousCarrousel = () => {
    setTransitioning(true)
    if (activeCarrousel > 0) {
      setActiveCarrousel(activeCarrousel - 1)
    } else {
      setActiveCarrousel(episodes.length - 1)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (activeCarrousel < episodes.length - 1) {
        setActiveCarrousel(activeCarrousel + 1)
      } else {
        setActiveCarrousel(0)
      }
      setTransitioning(true)
    }, 5000)
    return () => clearTimeout(timeout)
  }, [activeCarrousel, episodes.length])

  useEffect(() => {
    const timeout = setTimeout(() => setTransitioning(false), 500)
    return () => clearTimeout(timeout)
  }, [activeCarrousel, episodes.length])

  const renderLeftContent = () => {
    return (
      <div className={styles.leftContent}>
        <div className={styles.titleContainer}>
          {renderPodcastLogo()}
          {renderPodcastTitle()}
        </div>
        {renderEpisodeDescription()}
      </div>
    )
  }

  const renderRightContent = () => {
    return (
      <div className={styles.rightContent}>
        <a href={episodes[activeCarrousel].link}>{renderEpisodeThumbnail()}</a>
        {renderEpisodeSmallTitle()}
        <p className={styles.episodePrice}>Mint 0.1 Sol</p>
      </div>
    )
  }
  const renderPodcastLogo = () => {
    return (
      <div className={styles.podcastLogoContainer}>
        <img
          className={styles.podcastLogo}
          src={!transitioning ? episodes[activeCarrousel].logo : ""}
          alt=""
        />
      </div>
    )
  }
  const renderPodcastTitle = () => {
    return (
      <>
        <p className={` ${styles.podcastTitle} `}>
          {!transitioning && episodes[activeCarrousel].title}
        </p>
      </>
    )
  }
  const renderEpisodeDescription = () => {
    return (
      <div className={styles.episodeDescriptionContainer}>
        {!transitioning && episodes[activeCarrousel].description}
      </div>
    )
  }
  const renderEpisodeThumbnail = () => {
    return (
      <a target="_blank" aria-label={episodes[activeCarrousel].title}>
        {/* {isThumbnailMounted && (
          <Suspense
            fallback={
              <div className="h-[100px] w-[100px] bg-skin-fill md:h-[200px] md:w-[200px]">
                <i className={`"iconoir-hand-brake" `}></i>

                <FontAwesomeIcon
                  className="text-4xl animate-spin"
                  icon={FAProSolid.faSpinnerThird}
                />
              </div>
            }>
            <LazyEpisodeThumbnail
              src={!transitioning && episodes[activeCarrousel].episodeThumbnail}
              transitioning={transitioning}
            />
          </Suspense>
        )} */}
        <div className={styles.thumbnailContainer}>
          <img
            className={styles.thumbnail}
            src={episodes[activeCarrousel].episodeThumbnail}
            alt="Episode Thumbnail"
          />
        </div>
      </a>
    )
  }
  const renderEpisodeSmallTitle = () => {
    return (
      <p className={styles.episodeSmallTitle}>
        {/* {episodes[activeCarrousel].title} */}
        AI Special Guest
      </p>
    )
  }
  const renderPreviousButton = () => {
    return (
      <button aria-label="previous episode" onClick={handlePreviousCarrousel}>
        {/* <FontAwesomeIcon
          className="mt-1 text-xl font-extrabold hover:scale-105 active:scale-95"
          icon={FAProSolid.faLessThan}
        /> */}
        &lt;
      </button>
    )
  }
  const renderEpisodesDots = () => {
    function handleDotPress(index: number) {
      setActiveCarrousel(index)
      setTransitioning(true)
    }
    return (
      <div className="flex items-center gap-4">
        {episodes.map((_, index) => (
          <span
            aria-label={`Episode ${index + 1}`}
            onClick={() => handleDotPress(index)}
            key={index}
            className={`
              cursor-pointer text-2xl font-bold text-white transition-all duration-500
              ${
                activeCarrousel == index
                  ? "text-buttonAccentHover"
                  : "text-white"
              }
            `}>
            •
          </span>
        ))}
      </div>
    )
  }
  const renderNextButton = () => {
    return (
      <button aria-label="next episode" onClick={handleNextCarrousel}>
        &gt;
        {/* <FontAwesomeIcon
          className="mt-1 text-xl font-extrabold hover:scale-105 active:scale-95"
          icon={FAProSolid.faGreaterThan}
        /> */}
      </button>
    )
  }

  return (
    <div className={`text-light ${styles.carrouselEpisodesSection}`}>
      <p className="fs-1"> Featuring Now</p>
      <div className={styles.carrouselWrapper}>
        <div className={styles.carrouselContainer}>
          {renderLeftContent()}
          {renderRightContent()}
        </div>
      </div>
      <div className={styles.buttonContainer}>
        {renderPreviousButton()}
        {renderEpisodesDots()}
        {renderNextButton()}
      </div>
    </div>
  )
}

export default Carrousel
