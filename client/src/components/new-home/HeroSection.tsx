import styles from "./HeroSection.module.css"

const HeroSection = () => {
  return (
    <div className="text-light w-100 container-sm mx-auto d-flex flex-column align-items-center text-center">
      <div className={`w-100 ${styles.titleContainer}`}>
        <h1 className={`mt-5 ${styles.title}`}>UNLEASH YOUR STORY</h1>
      </div>

      <div className="container">
        <p className="mt-5 fs-5 ">
          Excalibur is a creator led audio platform built for creators to share
          and monetise their audio content using decentralised blockchain
          technology.{" "}
        </p>
        <p className="mt-4 fs-6 font-thin fst-italic">
          &quot;"We empower creators to build community with their audience and
          to be rewarded fairly. Excalibur is a Web3 audio platform designed to
          deliver a higher quality of media with a seamless web3 user
          experience."&quot;
        </p>
        <p>
          -{" "}
          <a
            className="link-primary"
            target="_blank"
            rel="noreferrer"
            href="https://www.linkedin.com/in/simon-smith-a860885/">
            Simon Smith
          </a>
          , CEO & Founder.
        </p>
        <a
          target="_blank"
          className="btn btn-primary mt-4 px-4 py-2 fw-medium rounded ">
          Get started
        </a>
      </div>
    </div>
  )
}

export default HeroSection
