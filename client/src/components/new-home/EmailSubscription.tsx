import styles from "./EmailSubscription.module.css"

function EmailSubscription() {
  return (
    <div className={`text-light ${styles.emailSubscription}`}>
      <p className={styles.title}>Stay up-to-date!</p>
      <div className={styles.formContainer}>
        <form
          method="post"
          action="https://sendfox.com/form/19w6yv/1y4v7e"
          className={styles.sendfoxForm}
          id="1y4v7e"
          data-async="true"
          data-recaptcha="false">
          <input
            className={styles.emailInput}
            type="email"
            id="sendfox_form_email"
            placeholder="example@example.com"
            name="email"
            required
          />
        </form>
        <button type="submit" className={` ${styles.submitButton}`}>
          Submit
        </button>
        <script src="https://sendfox.com/js/form.js"></script>
      </div>
    </div>
  )
}

export default EmailSubscription
