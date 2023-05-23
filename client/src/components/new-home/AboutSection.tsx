// import clsx from "clsx"
// import Image from "next/image"
import styles from "./AboutSection.module.css"
import { useEffect, useRef } from "react"

const AboutSection = () => {
  const ref1 = useRef<HTMLDivElement | null>(null)
  const ref2 = useRef<HTMLDivElement | null>(null)
  const ref3 = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("showAnimation")
          } else {
            entry.target.classList.remove("showAnimation")
          }
        })
      })

      const node1 = ref1.current
      const node2 = ref2.current
      const node3 = ref3.current

      if (node1) observer.observe(node1)
      if (node2) observer.observe(node2)
      if (node3) observer.observe(node3)

      return () => {
        if (node1) observer.unobserve(node1)
        if (node2) observer.unobserve(node2)
        if (node3) observer.unobserve(node3)
      }
    }
  }, [])

  return (
    <div className={`customFlex ${styles.customFlex} ${styles.customFlexMd}`}>
      <div
        ref={ref1}
        className={`featureSectionAnimated ${styles.featureSectionAnimated}`}>
        <div
          id="podcasts-image"
          className={`relative ${styles.customImageDiv}`}>
          <img
            className="rounded drop-shadow-md"
            src="https://excalibur.fm/_next/image?url=%2Fassets%2Fpodcast.webp&w=3840&q=75"
            alt=""
          />
        </div>
        <div>
          <h2
            className={` text-light ${styles.customTextXl} ${styles.customTextXlMd}`}>
            DECENTRALISED PODCASTS
          </h2>
          <p
            className={` text-light ${styles.customPara} ${styles.customParaMd}`}>
            Podcasts, each NFT is an Episode, each collection is a season. With
            Excalibur.FM, you can mint your audio podcast as an NFT within
            minutes. When the mint is complete, will be provided with a link
            that you can share so your content can be streamed, or minted by
            your audience, enabling you to monetise your content more
            effectively using web3 technology.
          </p>
        </div>
      </div>
      <div
        ref={ref2}
        className={`featureSectionAnimated ${styles.featureSectionAnimated}`}>
        <div
          id="podcasts-image"
          className={`relative ${styles.customImageDiv}`}>
          <img
            className="rounded drop-shadow-md"
            src="https://excalibur.fm/_next/image?url=%2Fassets%2Fpodcast.webp&w=3840&q=75"
            alt=""
          />
        </div>
        <div>
          <h2
            className={` text-light ${styles.customTextXl} ${styles.customTextXlMd}`}>
            DECENTRALISED PODCASTS
          </h2>
          <p
            className={` text-light ${styles.customPara} ${styles.customParaMd}`}>
            Podcasts, each NFT is an Episode, each collection is a season. With
            Excalibur.FM, you can mint your audio podcast as an NFT within
            minutes. When the mint is complete, will be provided with a link
            that you can share so your content can be streamed, or minted by
            your audience, enabling you to monetise your content more
            effectively using web3 technology.
          </p>
        </div>
      </div>
      <div
        ref={ref3}
        className={`featureSectionAnimated ${styles.featureSectionAnimated}`}>
        <div
          id="podcasts-image"
          className={`relative ${styles.customImageDiv}`}>
          <img
            className="rounded drop-shadow-md"
            src="https://excalibur.fm/_next/image?url=%2Fassets%2Fpodcast.webp&w=3840&q=75"
            alt=""
          />
        </div>
        <div>
          <h2
            className={` text-light ${styles.customTextXl} ${styles.customTextXlMd}`}>
            DECENTRALISED PODCASTS
          </h2>
          <p
            className={` text-light ${styles.customPara} ${styles.customParaMd}`}>
            Podcasts, each NFT is an Episode, each collection is a season. With
            Excalibur.FM, you can mint your audio podcast as an NFT within
            minutes. When the mint is complete, will be provided with a link
            that you can share so your content can be streamed, or minted by
            your audience, enabling you to monetise your content more
            effectively using web3 technology.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AboutSection
