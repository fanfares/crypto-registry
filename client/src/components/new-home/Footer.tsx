import styles from "./Footer.module.css"

function Footer() {
  return (
    <div className={`text-light ${styles.footer}`}>
      <div className={styles.linkContainer}>
        <div className={styles.linkGroup}>
          <p className={styles.title}>Community</p>

          <a
            href="https://twitter.com/ExcaliburDao"
            className={styles.link}
            target="_blank">
            Twitter
          </a>

          <a
            href="https://www.linkedin.com/company/excaliburdao/"
            className={styles.link}
            target="_blank">
            LinkedIn
          </a>
        </div>
        <div className={styles.linkGroup}>
          <p className={styles.title}>Legal</p>

          <a
            href="https://docs.excalibur.fm/docs/Terms"
            className={styles.link}
            target="_blank">
            Terms & Conditions
          </a>

          <a className={styles.link} href="mailto:support@excalibur.fm">
            Contact us
          </a>
        </div>
        <div className={styles.linkGroup}>
          <p className={styles.title}>Resources</p>

          <a
            href="https://docs.excalibur.fm/docs/Whitepaper"
            className={styles.link}
            target="_blank">
            Whitepaper
          </a>

          <a
            href="https://docs.excalibur.fm/docs/Litepaper"
            className={styles.link}
            target="_blank">
            Litepaper
          </a>
        </div>
      </div>
      <div className={styles.copyRightText}>
        ExcaliburFM, all rights reserved. 2022
      </div>
    </div>
  )
}

export default Footer
