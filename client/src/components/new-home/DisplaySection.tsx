// import { FAProSolid, FontAwesomeIcon } from "@excalibur/config/fontawesome"
import { Suspense, useEffect, useState } from "react"
import styles from "./DisplaySection.module.css"
// const LazyIframe = React.lazy(() => import("./LazyIframe"))

// const displayIcons = [
//   { icon: FAProSolid.faPodcast, text: "Podcasts & Audiobook" },
//   { icon: FAProSolid.faMoneyBillTransfer, text: "Royalties distribution" },
//   { icon: FAProSolid.faCommentsDollar, text: "Crowdfunding" },
//   { icon: FAProSolid.faPeople, text: "DAO Creation" },
// ]

const DisplaySection = () => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // const iconElements = displayIcons.map(({ icon, text }) => (
  //   <div className="col text-center" key={text}>
  //     <FontAwesomeIcon className={styles.iconSize} icon={icon} />
  //     <p className="mt-2">{text}</p>
  //   </div>
  // ))

  return (
    <div className="mt-5 py-5">
      <div className="mx-auto d-flex flex-column align-items-center justify-content-center">
        {isMounted && (
          <Suspense
            fallback={
              <div className="mt-4 d-flex align-items-center justify-content-center">
                {/* REPLACE ME WITH A SPINNER */}
                <i className={`"iconoir-hand-brake" ${styles.spinnerSize}`}></i>
              </div>
            }>
            <iframe
              className={`embed-responsive embed-responsive-16by9 mt-4 ${styles.videoFrame}`}
              src="https://www.youtube.com/embed/aWPJbuhwOxc?rel=0"
              title="Excalibur Explainer"
              frameBorder="0"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen></iframe>
          </Suspense>
        )}
      </div>

      <div className={styles.iconsContainer}>
        {/* REPLACE ME WITH ICONS */}

        <div className=" text-center text-light">
          <i className={` iconoir-hand-brake ${styles.iconSize}`} />
          <p className={`mt-2 ${styles.iconText}`}>text</p>{" "}
        </div>
        <div className=" text-center text-light">
          <i className={` iconoir-hand-brake ${styles.iconSize}`} />
          <p className={`mt-2 ${styles.iconText}`}>text</p>{" "}
        </div>
        <div className=" text-center text-light">
          <i className={` iconoir-hand-brake ${styles.iconSize}`} />
          <p className={`mt-2 ${styles.iconText}`}>text</p>{" "}
        </div>
        <div className=" text-center text-light">
          <i className={` iconoir-hand-brake ${styles.iconSize}`} />
          <p className={`mt-2 ${styles.iconText}`}>text</p>{" "}
        </div>
        {/* {iconElements} */}
      </div>
    </div>
  )
}

export default DisplaySection
