import styles from "./Navbar.module.css"

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles["logo-container"]}>
        <a className="navbar-brand" href="#">
          <img
            src="https://excalibur.fm/_next/image?url=%2Fassets%2Fexcalibur.png&w=3840&q=75"
            alt="Excalibur"
            className="d-inline-block align-text-top"
          />
        </a>
      </div>
      <a role="button" target="" className={styles.link}>
        Call to action{" "}
      </a>
    </nav>
  )
}

export default Navbar
